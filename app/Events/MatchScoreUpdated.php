<?php

namespace App\Events;

use App\Models\TournamentMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchScoreUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public TournamentMatch $match;
    public string $tournamentId;

    public function __construct(TournamentMatch $match, string $tournamentId)
    {
        $this->match = $match;
        $this->tournamentId = $tournamentId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel("tournament.{$this->tournamentId}"),
            new Channel("court.{$this->match->court_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'score.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->match->id,
            'court_id' => $this->match->court_id,
            'status' => $this->match->status,
            'team1_set1_score' => $this->match->team1_set1_score,
            'team2_set1_score' => $this->match->team2_set1_score,
            'team1_set2_score' => $this->match->team1_set2_score,
            'team2_set2_score' => $this->match->team2_set2_score,
            'team1_set3_score' => $this->match->team1_set3_score,
            'team2_set3_score' => $this->match->team2_set3_score,
            'current_game_score' => $this->match->current_game_score,
            'server_team' => $this->match->server_team,
            'winner_team_id' => $this->match->winner_team_id,
        ];
    }
}
