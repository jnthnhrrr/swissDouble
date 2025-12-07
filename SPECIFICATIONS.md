# Partnering

1. Team partners are assigned randomly each round.
2. In the first round, each player from the top half of the participants list is
   assigned a partner from the bottom half of the list.
2. No two players are partnered more than once in a tournament.
3. The partnering is independent from the points or Buchholz ranking players
   have, with one exception:
4. In each round, free games are assigned to players when the number of
   participants is not divisible by 4. The assignment follows a fair
   distribution rule: no player receives a second free game until all players
   have received at least one free game.

## Free Game Assignment

When the number of participants is not divisible by 4, in each round, some
players receive a point without playing a match.

The program supports two options for assigning these "free games", which can be
selected before the tournament starts:

+ Bottom-Ranking: among eligible players (those who have not yet had a free
  game), selects the lowest-ranked players first, based on their current
  ranking.

+ Random: among eligible players (those with the minimum number of free games so
  far), randomly selects players.

# Setting

After determining the partners for the next round, the matches for the new round
are set according to the selected pairing strategy.

The program supports two options for pairing teams, which can be selected before
the tournament starts:

+ Power-Pairing (Swiss System): each team plays against a team with the same
  amount of points. If this is not possible, the setting is chosen which
  minimises the difference.

+ Random: teams are paired randomly.

## Power-Pairing Details

In the current implementation, there are two notable differences from Swiss
System:

1. In Swiss System, each group is "folded", so that the top member of a group
plays against the bottom member of the group, and so on. In Swiss System this
ranking is determined according to the setting of the participants before the
tournament, taking a previous, external ranking into account. We don't do this,
the setting at the beginning of the tournament is not supposed to be in any
particular order. The order used for the setting is the randomly shuffled list
of participants.

2. In Swiss System, the number of times a player has been set against a player
from a different group (more points or less points) is tracked throughout the
tournament and taken into account for the new setting, in order to minimise the
times a player has to play out of their group. We don't do this.

# Match Results

## Sets to Win (Gewinnsätze)

Before starting a tournament, the number of sets required to win a match can be
configured.

1. A match is won when one team reaches exactly the configured number of sets to
win, while the opposing team has not reached that number.

2. Match results are entered by clicking buttons that display the number of sets
won by each team. Initially, both teams show "?" (question mark), indicating
that no result has been entered yet.

3. Clicking a button increments the set count for that team. The count cycles
from 0 to the number of sets to win, then wraps back to 0.

4. A round cannot be closed until all matches have valid results. A valid result
   requires:
   - Both teams have entered set counts (no "?" values)
   - Exactly one team has reached the number of sets to win
   - The other team has not reached that number

5. The following situations are invalid and prevent a round from being closed:
   - **Tie**: Both teams have reached the number of sets to win (e.g., both have
     3 sets when sets to win is 3)
   - **Incomplete**: Neither team has reached the number of sets to win (e.g.,
     2-1 when sets to win is 3)
   - **Partial entry**: One team has a value while the other still shows "?"


# Ranking

1. Participants are ranked by their points and, as a second criterion, by their
ranking according to Buchholz.
2. We calculate the Buchholz ranking of a player as the sum of the points of
their opponents minus the sum of the points of their partners.

# Edge Cases and Limitations

1. **Number of rounds exceeding number of players**: If the number of rounds in
a tournament exceeds the number of players, the program will fail to find
eligible players for team pairing. This occurs because each player can only be
partnered with each other player once, and with enough rounds, all possible
pairings will eventually be exhausted. Because this violates the rule that each
player should not be paired with any other player more than once, this edge case
is not handled in the code. The program will fail if this situation occurs.
