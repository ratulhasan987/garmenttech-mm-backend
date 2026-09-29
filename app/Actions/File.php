<?php

namespace App\Actions;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Spatie\ImageOptimizer\OptimizerChainFactory;



class File
{
    // Only for Image
    // public static function upload($file, $path)
    // {
    //     // Ensure destination folder exists
    //     $directory = public_path("storage/$path");
    //     if (!file_exists($directory)) {
    //         mkdir($directory, 0755, true);
    //     }

    //     $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    //     $savePath = "$directory/$fileName";

    //     $manager = new ImageManager(new Driver()); // use Imagick instead of GD for better compression if possible
    //     $image = $manager->read($file);

    //     // Force JPG (best compression) and save at low quality
    //     $image->toJpeg(quality: 40)->save($savePath); // Adjust quality as needed (20–60 is a good range)

    //     // Deep compression using Spatie (optional)
    //     $optimizer = OptimizerChainFactory::create();
    //     $optimizer->optimize($savePath);

    //     return "storage/$path/$fileName";
    // }

    // Its worked for any file
    // public static function upload($file, $path)
    // {
    //     // Ensure destination folder exists
    //     $directory = public_path("storage/$path");
    //     if (!file_exists($directory)) {
    //         mkdir($directory, 0755, true);
    //     }

    //     $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    //     $savePath = "$directory/$fileName";

    //     $extension = strtolower($file->getClientOriginalExtension());

    //     if (in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
    //         // Process image with Intervention
    //         $manager = new ImageManager(new Driver());
    //         $image = $manager->read($file);
    //         $image->toJpeg(quality: 30)->save($savePath); // Adjust quality as needed
    //     } else {
    //         // Just move non-image files (like PDF) without processing
    //         $file->move($directory, $fileName);
    //     }

    //     // Optimize (Spatie will skip if unsupported type)
    //     $optimizer = OptimizerChainFactory::create();
    //     $optimizer->optimize($savePath);

    //     return "storage/$path/$fileName";
    // }

    public static function upload(
        UploadedFile $file,
        string $path
    ): string {
        /*
        |--------------------------------------------------------------------------
        | Directory
        |--------------------------------------------------------------------------
        */

        Storage::disk('public')->makeDirectory(
            $path
        );

        /*
        |--------------------------------------------------------------------------
        | Extension
        |--------------------------------------------------------------------------
        */

        $extension = strtolower(
            $file->getClientOriginalExtension()
        );

        $isImage = in_array(
            $extension,
            [
                'jpg',
                'jpeg',
                'png',
                'webp',
            ],
            true
        );

        /*
        |--------------------------------------------------------------------------
        | File Name
        |--------------------------------------------------------------------------
        */

        $fileName =
            time()
            . '_'
            . uniqid()
            . '.'
            . $extension;

        $relativePath =
            $path . '/' . $fileName;

        $storagePath =
            Storage::disk('public')->path(
                $relativePath
            );

        /*
        |--------------------------------------------------------------------------
        | Image
        |--------------------------------------------------------------------------
        */

        if ($isImage) {
            $manager =
                ImageManager::usingDriver(
                    Driver::class
                );

            $image =
                $manager->decodeSplFileInfo(
                    $file
                );

            /*
            |--------------------------------------------------------------------------
            | Limit Large Images
            |--------------------------------------------------------------------------
            |
            | Maintains aspect ratio and does not upscale smaller images.
            |
            */

            $image->scaleDown(
                width: 1920,
                height: 1920
            );

            /*
            |--------------------------------------------------------------------------
            | Save
            |--------------------------------------------------------------------------
            |
            | Intervention determines output format from the extension.
            |
            */

            $image->save(
                $storagePath,
                quality: 75
            );
        } else {
            Storage::disk('public')->putFileAs(
                $path,
                $file,
                $fileName
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Optimize
        |--------------------------------------------------------------------------
        */

        if ($isImage && file_exists($storagePath)) {
            $optimizer =
                OptimizerChainFactory::create();

            $optimizer->optimize(
                $storagePath
            );
        }

        return 'storage/' . $relativePath;
    }

    // public static function fleUpload($file, $path, $size = [480, 480])
    // {
    //     $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

    //     $manager = new ImageManager(new Driver());

    //     $image = $manager->read($file);
    //     $image->resize($size[0], $size[1]);

    //     $image->save("storage/$path/" . $fileName);

    //     return "storage/$path/" . $fileName;
    // }

    public static function fileUpload(
        UploadedFile $file,
        string $path,
        array $size = [480, 480]
    ): string {
        $fileName =
            time()
            . '_'
            . uniqid()
            . '.'
            . $file->getClientOriginalExtension();

        /*
        |--------------------------------------------------------------------------
        | Make directory inside storage/app/public
        |--------------------------------------------------------------------------
        |
        | Example:
        | storage/app/public/Configure
        |
        */
        Storage::disk('public')->makeDirectory($path);

        /*
        |--------------------------------------------------------------------------
        | Get actual filesystem path
        |--------------------------------------------------------------------------
        |
        | Example:
        | C:\project\storage\app\public\Configure\image.png
        |
        */
        $storagePath = Storage::disk('public')->path(
            $path . '/' . $fileName
        );

        /*
        |--------------------------------------------------------------------------
        | Image Manager
        |--------------------------------------------------------------------------
        */
        $manager = ImageManager::usingDriver(
            Driver::class
        );

        /*
        |--------------------------------------------------------------------------
        | Decode Laravel UploadedFile
        |--------------------------------------------------------------------------
        */
        $image = $manager->decodeSplFileInfo(
            $file
        );

        /*
        |--------------------------------------------------------------------------
        | Resize
        |--------------------------------------------------------------------------
        */
        $image->contain(
            $size[0],
            $size[1]
        );

        /*
        |--------------------------------------------------------------------------
        | Save
        |--------------------------------------------------------------------------
        */
        $image->save($storagePath);

        /*
        |--------------------------------------------------------------------------
        | Return public URL path for database
        |--------------------------------------------------------------------------
        */
        return 'storage/' . $path . '/' . $fileName;
    }

    public static function deleteFile($file)
    {
        if (file_exists($file)) {
            unlink($file);
        }
    }
}
