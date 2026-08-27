<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use App\Models\CmsSection;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/cms-pages.json');
        if (! is_file($path)) {
            $this->command->warn('  CmsSeeder: cms-pages.json not found, skipping.');

            return;
        }

        $pages = json_decode(file_get_contents($path), true) ?: [];
        foreach ($pages as $i => $p) {
            $page = CmsPage::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'title' => $p['title'],
                    'eyebrow' => $p['eyebrow'] ?? null,
                    'summary' => $p['summary'] ?? null,
                    'hero_category' => $p['hero_category'] ?? null,
                    'parent_slug' => $p['parent_slug'] ?? null,
                    'status' => 'published',
                    'position' => $i,
                    'published_at' => now(),
                    'seo' => ['title' => $p['title'], 'description' => $p['summary'] ?? null],
                ],
            );

            // Only seed sections on first creation — never clobber CMS edits.
            if ($page->sections()->exists()) {
                continue;
            }
            foreach (($p['sections'] ?? []) as $pos => $section) {
                $kind = $section['kind'];
                unset($section['kind']);
                CmsSection::create([
                    'cms_page_id' => $page->id,
                    'kind' => $kind,
                    'position' => $pos,
                    'data' => $section,
                ]);
            }
        }

        $this->command->info('  CmsSeeder: '.CmsPage::count().' pages, '.CmsSection::count().' sections.');
    }
}
