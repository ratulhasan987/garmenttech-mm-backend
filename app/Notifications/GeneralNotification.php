<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class GeneralNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Notification data.
     *
     * @var array
     */
    protected array $data;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Delivery channels.
     */
    public function via(object $notifiable): array
    {
        return [
            'database',
            'broadcast',
        ];
    }

    /**
     * Store notification in database.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => $this->data['type'] ?? 'general',
            'title'      => $this->data['title'] ?? 'Notification',
            'message'    => $this->data['message'] ?? '',
            'url'        => $this->data['url'] ?? '#',
            'icon'       => $this->data['icon'] ?? 'fa fa-bell',
            'color'      => $this->data['color'] ?? 'primary',
            'created_at' => now()->toDateTimeString(),
        ];
    }

    /**
     * Broadcast notification via Reverb.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type'       => $this->data['type'] ?? 'general',
            'title'      => $this->data['title'] ?? 'Notification',
            'message'    => $this->data['message'] ?? '',
            'url'        => $this->data['url'] ?? '#',
            'icon'       => $this->data['icon'] ?? 'fa fa-bell',
            'color'      => $this->data['color'] ?? 'primary',
            'created_at' => now()->diffForHumans(),
        ]);
    }

    /**
     * Array representation (optional).
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
