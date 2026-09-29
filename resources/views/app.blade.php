@php
    $configure = App\Models\Configure::firstOrFail();
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Riho favicon --}}
    {{-- <link rel="icon" href="{{ asset('favicon.png') }}" type="image/x-icon"> --}}
    <link rel="icon" href="{{ asset($configure->logo ?? 'Backend/assets/images/favicon.png') }}" type="image/x-icon">

    <script>
        window.appConfig = @json([
            'name' => $configure->name,
        ]);
    </script>

    {{-- Google Font used by Riho --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap"
        rel="stylesheet">

    {{-- Riho Icons --}}
    <link rel="stylesheet" href="{{ asset('riho/assets/css/font-awesome.css') }}">

    <link rel="stylesheet" href="{{ asset('riho/assets/css/vendors/icofont.css') }}">

    <link rel="stylesheet" href="{{ asset('riho/assets/css/vendors/themify.css') }}">

    <link rel="stylesheet" href="{{ asset('riho/assets/css/vendors/flag-icon.css') }}">

    {{-- Riho Vendor CSS --}}
    <link rel="stylesheet" href="{{ asset('riho/assets/css/vendors/scrollbar.css') }}">

    {{-- Bootstrap 5.3 --}}
    <link rel="stylesheet" href="{{ asset('riho/assets/css/vendors/bootstrap.css') }}">

    {{-- Riho Main Theme --}}
    <link rel="stylesheet" href="{{ asset('riho/assets/css/style.css') }}">

    {{-- Riho Theme Color --}}
    <link id="color" rel="stylesheet" href="{{ asset('riho/assets/css/color-1.css') }}" media="screen">

    {{-- Riho Responsive --}}
    <link rel="stylesheet" href="{{ asset('riho/assets/css/responsive.css') }}">


    {{-- Dropzone --}}
    <link rel="stylesheet" href="{{ asset('riho/assets/css/vendors/dropzone.css') }}">

    {{-- Laravel / React / Vite --}}
    @viteReactRefresh

    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])

    <x-inertia::head />
</head>

<body>
    <x-inertia::app />

    {{-- Bootstrap JS --}}
    <script src="{{ asset('riho/assets/js/bootstrap/bootstrap.bundle.min.js') }}"></script>
    {{-- <script>
        document.addEventListener("DOMContentLoaded", function() {

            if (window.Echo) {

                console.log("Echo loaded ✅");

                const connection = window.Echo.connector.pusher.connection;

                // When websocket connects
                connection.bind('connected', function() {
                    console.log("WebSocket Connected ✅");
                });

                // When state changes
                connection.bind('state_change', function(states) {
                    console.log("WebSocket State:", states.current);
                });

                // When error happens
                connection.bind('error', function(error) {
                    console.error("WebSocket Error ❌", error);
                });

            } else {
                console.error("Echo not loaded ❌");
            }

        });
    </script> --}}

</body>

</html>
