<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    /** Idempotent — returns the existing invoice if one is already issued. */
    public function generateFor(Booking $booking): Invoice
    {
        if ($booking->invoice) {
            return $booking->invoice;
        }

        $fy = $this->financialYear();
        $seq = Invoice::where('financial_year', $fy)->count() + 1;
        $number = sprintf('CW/%s/%04d', $fy, $seq);

        $gstPercent = (float) ($booking->subtotal > 0
            ? round($booking->tax / ($booking->subtotal - $booking->discount) * 100)
            : (float) config('payments.gst.rate', 12));

        $homeState = strtolower(config('payments.gst.home_state', 'odisha'));
        $buyerState = strtolower((string) ($booking->guest?->address['state'] ?? $booking->guest?->nationality ?? ''));
        $interState = $buyerState !== '' && $buyerState !== $homeState && $buyerState !== 'india';

        $taxable = round((float) $booking->subtotal - (float) $booking->discount, 2);
        $tax = (float) $booking->tax;

        $lineItems = [
            [
                'description' => $booking->program?->name
                    ? "{$booking->program->name} — residential programme ({$booking->nights} nights)"
                    : "{$booking->roomCategory?->name} — {$booking->nights} nights",
                'hsn' => '9963',
                'amount' => (float) $booking->subtotal,
            ],
        ];
        if ((float) $booking->discount > 0) {
            $lineItems[] = ['description' => "Discount ({$booking->promo_code})", 'hsn' => '', 'amount' => -1 * (float) $booking->discount];
        }

        $invoice = $booking->invoice()->create([
            'number' => $number,
            'status' => $booking->balanceDue() <= 0 ? 'paid' : 'issued',
            'financial_year' => $fy,
            'gstin' => config('payments.gst.gstin'),
            'place_of_supply' => config('payments.gst.home_state'),
            'buyer_name' => $booking->guest?->full_name,
            'buyer_state' => $booking->guest?->address['state'] ?? null,
            'line_items' => $lineItems,
            'subtotal' => $taxable,
            'cgst' => $interState ? 0 : round($tax / 2, 2),
            'sgst' => $interState ? 0 : round($tax / 2, 2),
            'igst' => $interState ? $tax : 0,
            'total' => round($taxable + $tax, 2),
            'issued_at' => now(),
        ]);

        $this->renderPdf($booking->refresh(), $invoice, $gstPercent);

        return $invoice;
    }

    public function pdfPath(Invoice $invoice): string
    {
        if (! $invoice->pdf_path || ! Storage::disk('local')->exists($invoice->pdf_path)) {
            $this->renderPdf($invoice->booking()->with(['guest', 'program', 'roomCategory'])->first(), $invoice, 12);
            $invoice->refresh();
        }

        return Storage::disk('local')->path($invoice->pdf_path);
    }

    private function renderPdf(Booking $booking, Invoice $invoice, float $gstPercent): void
    {
        $pdf = Pdf::loadView('invoices.tax-invoice', [
            'booking' => $booking,
            'invoice' => $invoice,
            'gst' => config('payments.gst'),
            'gstPercent' => $gstPercent,
        ])->setPaper('a4');

        $safe = str_replace(['/', '\\'], '-', $invoice->number);
        $path = "invoices/{$safe}.pdf";
        Storage::disk('local')->put($path, $pdf->output());
        $invoice->update(['pdf_path' => $path]);
    }

    private function financialYear(): string
    {
        $now = now();
        $start = $now->month >= 4 ? $now->year : $now->year - 1;

        return sprintf('%d-%02d', $start, ($start + 1) % 100);
    }
}
