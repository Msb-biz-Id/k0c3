<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\HeroSlide;
use App\Models\PartnerSlide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompanyProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Company', [
            'settings' => CompanySetting::getSettings(),
            'heroSlides' => HeroSlide::orderBy('sort_order', 'asc')->orderBy('created_at', 'desc')->get(),
            'partnerSlides' => PartnerSlide::orderBy('sort_order', 'asc')->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function updateCompany(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'base_url' => 'nullable|url|max:255',
            'tagline' => 'nullable|string|max:255',
            'about_text' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'whatsapp_number' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'google_maps_embed' => 'nullable|string',
            'social_links' => 'nullable|array',
            'social_links.instagram' => 'nullable|string|max:255',
            'social_links.tiktok' => 'nullable|string|max:255',
            'social_links.youtube' => 'nullable|string|max:255',
            'social_links.linkedin' => 'nullable|string|max:255',
            'social_links.twitter' => 'nullable|string|max:255',
            'social_links.facebook' => 'nullable|string|max:255',
            'landing_sections' => 'nullable|array',
            'landing_sections.tournament_badge' => 'nullable|string|max:100',
            'landing_sections.tournament_title' => 'nullable|string|max:255',
            'landing_sections.tournament_subtitle' => 'nullable|string',
            'landing_sections.athletes_badge' => 'nullable|string|max:100',
            'landing_sections.athletes_title' => 'nullable|string|max:255',
            'landing_sections.athletes_subtitle' => 'nullable|string',
            'landing_sections.partners_badge' => 'nullable|string|max:100',
            'landing_sections.partners_title' => 'nullable|string|max:255',
            'landing_sections.footer_about' => 'nullable|string',
            'landing_sections.footer_copyright' => 'nullable|string|max:255',
            'enable_preloader' => 'nullable|boolean',
            'primary_color' => 'nullable|string|max:50',
            'custom_color_hex' => 'nullable|string|max:20',
            'typography_preset' => 'nullable|string|max:50',
            'logo_light' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
            'logo_dark' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png,svg|max:1024',
        ]);

        $settings = CompanySetting::first() ?? new CompanySetting();

        if ($request->hasFile('logo_light')) {
            if ($settings->logo_light_path && Storage::disk('public')->exists($settings->logo_light_path)) {
                Storage::disk('public')->delete($settings->logo_light_path);
            }
            $settings->logo_light_path = $request->file('logo_light')->store('company', 'public');
        }

        if ($request->hasFile('logo_dark')) {
            if ($settings->logo_dark_path && Storage::disk('public')->exists($settings->logo_dark_path)) {
                Storage::disk('public')->delete($settings->logo_dark_path);
            }
            $settings->logo_dark_path = $request->file('logo_dark')->store('company', 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($settings->favicon_path && Storage::disk('public')->exists($settings->favicon_path)) {
                Storage::disk('public')->delete($settings->favicon_path);
            }
            $settings->favicon_path = $request->file('favicon')->store('company', 'public');
        }

        $settings->company_name = $validated['company_name'];
        $settings->base_url = $validated['base_url'] ?? null;
        $settings->tagline = $validated['tagline'] ?? null;
        $settings->about_text = $validated['about_text'] ?? null;
        $settings->email = $validated['email'] ?? null;
        $settings->phone = $validated['phone'] ?? null;
        $settings->whatsapp_number = $validated['whatsapp_number'] ?? null;
        $settings->address = $validated['address'] ?? null;
        $settings->google_maps_embed = $validated['google_maps_embed'] ?? null;
        $settings->social_links = $validated['social_links'] ?? [];
        $settings->landing_sections = $validated['landing_sections'] ?? [];
        $settings->enable_preloader = $request->boolean('enable_preloader', true);
        $settings->primary_color = $validated['primary_color'] ?? 'emerald';
        $settings->custom_color_hex = $validated['custom_color_hex'] ?? null;
        $settings->typography_preset = $validated['typography_preset'] ?? 'athletic_broadcast';

        $settings->save();
        CompanySetting::clearCache();

        return back()->with('success', 'Profil perusahaan & branding berhasil diperbarui.');
    }

    public function updateSeo(Request $request)
    {
        $validated = $request->validate([
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string|max:500',
            'keywords' => 'nullable|string|max:500',
            'twitter_card' => 'nullable|string|in:summary,summary_large_image',
            'google_site_verification' => 'nullable|string|max:255',
            'google_analytics_id' => 'nullable|string|max:100',
            'og_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
        ]);

        $settings = CompanySetting::first() ?? new CompanySetting();
        $seoMeta = $settings->seo_meta ?? [];

        if ($request->hasFile('og_image')) {
            if (!empty($seoMeta['og_image_path']) && Storage::disk('public')->exists($seoMeta['og_image_path'])) {
                Storage::disk('public')->delete($seoMeta['og_image_path']);
            }
            $seoMeta['og_image_path'] = $request->file('og_image')->store('seo', 'public');
        }

        $seoMeta['meta_title'] = $validated['meta_title'];
        $seoMeta['meta_description'] = $validated['meta_description'];
        $seoMeta['keywords'] = $validated['keywords'] ?? null;
        $seoMeta['twitter_card'] = $validated['twitter_card'] ?? 'summary_large_image';
        $seoMeta['google_site_verification'] = $validated['google_site_verification'] ?? null;
        $seoMeta['google_analytics_id'] = $validated['google_analytics_id'] ?? null;

        $settings->seo_meta = $seoMeta;
        $settings->save();
        CompanySetting::clearCache();

        return back()->with('success', 'Pengaturan SEO & Web Analytics berhasil diperbarui.');
    }

    public function storeHeroSlide(Request $request)
    {
        $validated = $request->validate([
            'badge_text' => 'nullable|string|max:100',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string|max:255',
            'secondary_cta_text' => 'nullable|string|max:100',
            'secondary_cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('hero', 'public');
        }

        HeroSlide::create([
            'badge_text' => $validated['badge_text'] ?? null,
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'cta_text' => $validated['cta_text'] ?? null,
            'cta_link' => $validated['cta_link'] ?? null,
            'secondary_cta_text' => $validated['secondary_cta_text'] ?? null,
            'secondary_cta_link' => $validated['secondary_cta_link'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
            'image_path' => $imagePath,
        ]);

        return back()->with('success', 'Hero slide berhasil ditambahkan.');
    }

    public function updateHeroSlide(Request $request, string $id)
    {
        $slide = HeroSlide::findOrFail($id);

        $validated = $request->validate([
            'badge_text' => 'nullable|string|max:100',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string|max:255',
            'secondary_cta_text' => 'nullable|string|max:100',
            'secondary_cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image')) {
            if ($slide->image_path && Storage::disk('public')->exists($slide->image_path)) {
                Storage::disk('public')->delete($slide->image_path);
            }
            $slide->image_path = $request->file('image')->store('hero', 'public');
        }

        $slide->update([
            'badge_text' => $validated['badge_text'] ?? null,
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'cta_text' => $validated['cta_text'] ?? null,
            'cta_link' => $validated['cta_link'] ?? null,
            'secondary_cta_text' => $validated['secondary_cta_text'] ?? null,
            'secondary_cta_link' => $validated['secondary_cta_link'] ?? null,
            'sort_order' => $validated['sort_order'] ?? $slide->sort_order,
            'is_active' => $request->boolean('is_active', $slide->is_active),
        ]);

        return back()->with('success', 'Hero slide berhasil diperbarui.');
    }

    public function destroyHeroSlide(string $id)
    {
        $slide = HeroSlide::findOrFail($id);

        if ($slide->image_path && Storage::disk('public')->exists($slide->image_path)) {
            Storage::disk('public')->delete($slide->image_path);
        }

        $slide->delete();

        return back()->with('success', 'Hero slide berhasil dihapus.');
    }

    public function toggleHeroSlideStatus(string $id)
    {
        $slide = HeroSlide::findOrFail($id);
        $slide->is_active = !$slide->is_active;
        $slide->save();

        return back()->with('success', 'Status slide berhasil diubah.');
    }

    public function storePartnerSlide(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tier' => 'required|string|max:100',
            'website_url' => 'nullable|url|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('partners', 'public');
        }

        PartnerSlide::create([
            'name' => $validated['name'],
            'tier' => $validated['tier'],
            'website_url' => $validated['website_url'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
            'logo_path' => $logoPath,
        ]);

        return back()->with('success', 'Mitra / Sponsor berhasil ditambahkan.');
    }

    public function updatePartnerSlide(Request $request, string $id)
    {
        $partner = PartnerSlide::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tier' => 'required|string|max:100',
            'website_url' => 'nullable|url|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($partner->logo_path && Storage::disk('public')->exists($partner->logo_path)) {
                Storage::disk('public')->delete($partner->logo_path);
            }
            $partner->logo_path = $request->file('logo')->store('partners', 'public');
        }

        $partner->update([
            'name' => $validated['name'],
            'tier' => $validated['tier'],
            'website_url' => $validated['website_url'] ?? null,
            'sort_order' => $validated['sort_order'] ?? $partner->sort_order,
            'is_active' => $request->boolean('is_active', $partner->is_active),
        ]);

        return back()->with('success', 'Mitra / Sponsor berhasil diperbarui.');
    }

    public function destroyPartnerSlide(string $id)
    {
        $partner = PartnerSlide::findOrFail($id);

        if ($partner->logo_path && Storage::disk('public')->exists($partner->logo_path)) {
            Storage::disk('public')->delete($partner->logo_path);
        }

        $partner->delete();

        return back()->with('success', 'Mitra / Sponsor berhasil dihapus.');
    }

    public function togglePartnerSlideStatus(string $id)
    {
        $partner = PartnerSlide::findOrFail($id);
        $partner->is_active = !$partner->is_active;
        $partner->save();

        return back()->with('success', 'Status mitra / sponsor berhasil diubah.');
    }
}
