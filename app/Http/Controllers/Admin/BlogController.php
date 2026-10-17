<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Mews\Purifier\Facades\Purifier;

class BlogController extends Controller
{
    /**
     * Display listing of blog articles for Superadmin/Editor.
     */
    public function index(): Response
    {
        $posts = BlogPost::with(['author', 'category'])
            ->latest('created_at')
            ->paginate(15);

        return Inertia::render('Admin/Blog/Index', [
            'posts' => $posts,
        ]);
    }

    /**
     * Show form to create new article.
     */
    public function create(): Response
    {
        $categories = BlogCategory::all();

        return Inertia::render('Admin/Blog/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store new article with HTMLPurifier anti-XSS.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:blog_categories,id'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:draft,published,archived'],
            'featured_image' => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = null;
        if ($request->hasFile('featured_image')) {
            $imagePath = $request->file('featured_image')->store('blog', 'public');
        }

        $cleanContent = Purifier::clean($validated['content']);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (BlogPost::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-" . $counter++;
        }

        BlogPost::create([
            'author_id' => Auth::id(),
            'category_id' => $validated['category_id'] ?? null,
            'title' => $validated['title'],
            'slug' => $slug,
            'featured_image' => $imagePath,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $cleanContent,
            'meta_title' => $validated['meta_title'] ?? $validated['title'],
            'meta_description' => $validated['meta_description'] ?? null,
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        return redirect()->route('admin.blog.index')
            ->with('success', 'Artikel blog berhasil diterbitkan.');
    }

    /**
     * Delete article.
     */
    public function destroy(string $id): RedirectResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return back()->with('success', 'Artikel berhasil dihapus.');
    }
}
