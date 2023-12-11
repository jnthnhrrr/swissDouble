# Partnering

1. Teams are assigned randomly each round.
2. No two players are partnered more than once in a tournament.
3. The partnering is independent from the points or buchholz players have, with
   one exception:
4. In each round, the players who have the lowest rank and have not yet had a
   free game, will be assigned a free game.

# Setting

1. After determining the partners for the next round, the new round is set
   according to the logic of Swiss System: Each team plays against a team with
   the same amount of points. If this is not possible, the setting is chosen
   which minimises the difference.
2. In the current implementation, there are two notable differences from Swiss
   System
    1. In Swiss System, each group is "folded", so that the top member of a
       group plays against the bottom member of the group, and so on. In Swiss
       System this ranking is determined according to the setting of the
       participants before the tournament, taking a previous, external ranking
       into account.
       We don't do this, the setting at the beginning of the tournament is not
       supposed to be in any particular order. The order used for the setting
       is the randomly shuffled list of participants.
    2. In Swiss System, the number of times a player has been set against a
       player from a different group (more points or less points) is tracked
       throughout the tournament and taken into account for the new setting, in
       order to minimise the times a player has to play out of their group. We
       don't do this.

# Ranking

1. Participants are ranked by their points and, as a second criterion, by their
   ranking accodring to Buchholz.
2. We calculate the Buchholz ranking of a player as the sum of the points of
   their opponents minus the sum of the points of their partners.
