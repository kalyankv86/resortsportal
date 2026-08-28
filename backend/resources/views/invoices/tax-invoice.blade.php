<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { font-family: DejaVu Sans, sans-serif; }
  body { font-size: 11px; color: #1f2a22; margin: 32px; }
  h1 { font-size: 18px; margin: 0 0 2px; color: #14532d; }
  .muted { color: #5b6b5f; }
  .row { width: 100%; }
  .row td { vertical-align: top; padding: 2px 0; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 16px; }
  table.items th { background: #14532d; color: #faf8f2; text-align: left; padding: 7px 8px; font-size: 10px; }
  table.items td { border-bottom: 1px solid #e6e0d1; padding: 7px 8px; }
  .right { text-align: right; }
  .totals { width: 45%; margin-left: 55%; margin-top: 10px; }
  .totals td { padding: 3px 0; }
  .grand { border-top: 2px solid #14532d; font-size: 13px; font-weight: bold; color: #14532d; }
  .foot { margin-top: 36px; font-size: 10px; color: #5b6b5f; }
</style>
</head>
<body>
  <table class="row">
    <tr>
      <td>
        <h1>{{ $gst['legal_name'] }}</h1>
        <div class="muted">Centurion Wellness Eco Tourism</div>
        <div class="muted">{{ $gst['address'] }}</div>
        @if($gst['gstin'])<div class="muted">GSTIN: {{ $gst['gstin'] }}</div>@endif
      </td>
      <td class="right">
        <div style="font-size:15px;font-weight:bold;color:#14532d;">TAX INVOICE</div>
        <div>{{ $invoice->number }}</div>
        <div class="muted">{{ optional($invoice->issued_at)->format('d M Y') }}</div>
        <div class="muted">Status: {{ ucfirst($invoice->status) }}</div>
      </td>
    </tr>
  </table>

  <table class="row" style="margin-top:18px;">
    <tr>
      <td>
        <strong>Bill to</strong><br>
        {{ $invoice->buyer_name ?? $booking->guest?->full_name }}<br>
        <span class="muted">{{ $booking->contact_email }}</span><br>
        <span class="muted">{{ $booking->contact_phone }}</span>
      </td>
      <td>
        <strong>Stay</strong><br>
        Booking {{ $booking->reference }}<br>
        <span class="muted">{{ $booking->check_in->format('d M Y') }} &rarr; {{ $booking->check_out->format('d M Y') }} ({{ $booking->nights }} nights)</span><br>
        <span class="muted">Place of supply: {{ $invoice->place_of_supply }}</span>
      </td>
    </tr>
  </table>

  <table class="items">
    <thead>
      <tr><th>Description</th><th>HSN/SAC</th><th class="right">Amount (₹)</th></tr>
    </thead>
    <tbody>
      @foreach($invoice->line_items as $li)
        <tr>
          <td>{{ $li['description'] }}</td>
          <td>{{ $li['hsn'] }}</td>
          <td class="right">{{ number_format($li['amount'], 2) }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Taxable value</td><td class="right">₹ {{ number_format($invoice->subtotal, 2) }}</td></tr>
    @if($invoice->igst > 0)
      <tr><td>IGST @ {{ $gstPercent }}%</td><td class="right">₹ {{ number_format($invoice->igst, 2) }}</td></tr>
    @else
      <tr><td>CGST @ {{ $gstPercent / 2 }}%</td><td class="right">₹ {{ number_format($invoice->cgst, 2) }}</td></tr>
      <tr><td>SGST @ {{ $gstPercent / 2 }}%</td><td class="right">₹ {{ number_format($invoice->sgst, 2) }}</td></tr>
    @endif
    <tr class="grand"><td>Total</td><td class="right">₹ {{ number_format($invoice->total, 2) }}</td></tr>
    <tr><td>Amount paid</td><td class="right">₹ {{ number_format($booking->amountPaid(), 2) }}</td></tr>
    <tr><td>Balance due</td><td class="right">₹ {{ number_format($booking->balanceDue(), 2) }}</td></tr>
  </table>

  <div class="foot">
    This is a computer-generated invoice. For queries contact {{ 'prasant.panda@cutm.ac.in' }}.<br>
    Cancellation &amp; refund terms apply as per the booking policy.
  </div>
</body>
</html>
