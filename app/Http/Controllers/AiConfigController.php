<?php

namespace App\Http\Controllers;

use App\Models\GroqApiKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiConfigController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('settings/ai-config/index', [
            'keys' => GroqApiKey::query()->oldest()->get(['id', 'last_four']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:1000'],
        ]);

        $key = trim($validated['key']);
        if ($key === '') {
            return back()->withErrors(['key' => 'Enter an API key.']);
        }

        $fingerprint = hash('sha256', $key);
        if (GroqApiKey::where('fingerprint', $fingerprint)->exists()) {
            return back()->withErrors(['key' => 'This API key is already saved.']);
        }

        GroqApiKey::create([
            'key' => $key,
            'fingerprint' => $fingerprint,
            'last_four' => substr($key, -4),
        ]);

        return back()->with('success', 'API key added.');
    }

    public function reveal(GroqApiKey $groqApiKey): JsonResponse
    {
        return response()
            ->json(['key' => $groqApiKey->key])
            ->header('Cache-Control', 'no-store, private');
    }

    public function destroy(GroqApiKey $groqApiKey): RedirectResponse
    {
        $groqApiKey->delete();

        return back()->with('success', 'API key deleted.');
    }
}
