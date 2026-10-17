<?php

namespace App\Http\Controllers;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicBlogController extends Controller
{
    /**
     * Display public blog directory.
     */
    public function index(Request $request): Response
    {
        $categorySlug = $request->input('category');

        $query = BlogPost::published()->with(['author', 'category']);

        if ($categorySlug) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $categorySlug));
        }

        $posts = $query->paginate(9)->withQueryString();
        $categories = BlogCategory::withCount('posts')->get();

        return Inertia::render('Public/Blog/Index', [
            'posts' => $posts,
            'categories' => $categories,
            'currentCategory' => $categorySlug,
        ]);
    }

    /**
     * Read single blog post.
     */
    public function show(string $slug): Response
    {
        $post = BlogPost::published()
            ->where('slug', $slug)
            ->with(['author', 'category'])
            ->firstOrFail();

        $relatedPosts = BlogPost::published()
            ->where('id', '!=', $post->id)
            ->take(3)
            ->get();

        return Inertia::render('Public/Blog/Show', [
            'post' => $post,
            'relatedPosts' => $relatedPosts,
        ]);
    }
}
