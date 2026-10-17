<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('tournament.{tournamentId}', function () {
    return true; // Public tournament broadcast
});

Broadcast::channel('court.{courtId}', function () {
    return true; // Public court scoreboard broadcast
});
