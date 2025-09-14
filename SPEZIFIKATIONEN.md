# Partnerzuteilung

1. Die Doppel-Teams werden in jeder Runde zufällig zusammengestellt.

2. In der ersten Runde wird jede:r Spieler:in aus der oberen Hälfte der
   Liste ein:e Partner:in aus der unteren Hälfte der Liste zugewiesen.

3. Keine zwei Spieler:innen werden in einem Turnier mehr als einmal als Team
   zusammengestellt.

4. Die Paarzuteilung ist unabhängig von den Punkten oder der Buchholz-Wertung
   der Spieler:innen, mit einer Ausnahme:

5. In jeder Runde erhalten die Spieler:innen mit der niedrigsten Platzierung,
   die noch kein Freilos hatten, ein Freilos zugewiesen.

# Setzung

1. Nach der Bestimmung der Doppel-Teams für die nächste Runde wird die neue
   Runde nach dem "Power Pairing" (auch: "Schweizer System") gesetzt: Jedes Team
   spielt gegen ein Team mit der gleichen Anzahl von Punkten. Falls dies nicht
   möglich ist, wird die Setzung gewählt, die den Unterschied minimiert.

2. In der aktuellen Implementierung gibt es zwei bemerkenswerte Unterschiede zum
   Schweizer System:

    1. Im Schweizer System wird jede Gruppe "gefaltet", sodass das oberste
       Mitglied einer Gruppe gegen das unterste Mitglied der Gruppe spielt, und
       so weiter. Im Schweizer System wird diese Rangfolge entsprechend der
       Setzung der Teilnehmer vor dem Turnier bestimmt, unter Berücksichtigung
       einer vorherigen, externen Rangliste. Wir machen das nicht. Die Setzung
       zu Beginn des Turniers soll nicht in einer bestimmten Reihenfolge
       erfolgen. Die für die Setzung verwendete Reihenfolge ist die zufällig
       gemischte Liste der Teilnehmer.

    2. Im Schweizer System wird die Anzahl der Male, die ein Spieler gegen einen
       Spieler aus einer anderen Gruppe (mehr Punkte oder weniger Punkte)
       gesetzt wurde, während des gesamten Turniers verfolgt und bei der neuen
       Setzung berücksichtigt, um die Anzahl der Male zu minimieren, in denen
       ein Spieler außerhalb seiner Gruppe spielen muss. Das machen wir nicht.

# Rangliste

1. Die Teilnehmer:innen werden nach ihren Spielpunkten und als zweites Kriterium
   nach ihrer Buchholz-Wertung eingestuft. (Die Satzpunkte werden nicht
   berücksichtigt).

2. Wir berechnen die Buchholz-Wertung ein:er Spieler:in als die Summe der Punkte
   ihrer Gegner:innen minus die Summe der Punkte ihrer Partner:innen.
