# Teamzusammenstellung

1. Die Doppel-Teams werden in jeder Runde zufällig zusammengestellt.

2. In der ersten Runde wird jede:r Spieler:in aus der oberen Hälfte der
   Liste ein:e Partner:in aus der unteren Hälfte der Liste zugewiesen.

3. Keine zwei Spieler:innen werden in einem Turnier mehr als einmal als Team
   zusammengestellt.
4. Die Paarzuteilung ist unabhängig von den Punkten oder der Buchholz-Wertung
   der Spieler:innen, mit einer Ausnahme:

5. In jeder Runde werden Freilose zugewiesen, wenn die Anzahl der
   Teilnehmer:innen nicht durch 4 teilbar ist. Die Zuweisung folgt einer
   fairen Verteilungsregel: Keine:r Spieler:in erhält ein zweites Freilos,
   bevor alle Spieler:innen mindestens ein Freilos erhalten haben.

## Freilos-Vergabe

Wenn die Zahl der Teilnehmer:innen nicht durch 4 teilbar ist, erhalten in jeder
Runde einige Spieler "kampflos" einen Punkt.

Das Programm unterstützt zwei Optionen für die Vergabe dieser "Freilose", die
vor Turnierbeginn ausgewählt werden können:

+ Von Unten: wählt unter den berechtigten Spieler:innen (diejenigen, die bisher
  noch kein Freilos hatten) zuerst die am niedrigsten platzierten Spieler:innen
  aus, basierend auf ihrer aktuellen Platzierung.

+ Zufällig: wählt unter den berechtigten Spieler:innen zufällig Spieler:innen
  aus.

# Setzung

1. Nach der Bestimmung der Doppel-Teams für die nächste Runde wird die neue
   Runde nach dem "Power Pairing" (auch: "Schweizer System") gesetzt: Jedes Team
   spielt gegen ein Team mit der gleichen Punktzahl. Falls dies nicht möglich
   ist, wird diejenige Setzung gewählt, die den Unterschied minimiert.

2. In der aktuellen Implementierung gibt es zwei bemerkenswerte Unterschiede zum
   Schweizer System:

    1. Im Schweizer System wird jede Gruppe "gefaltet", sodass das oberste
       Mitglied einer Gruppe gegen das unterste Mitglied der Gruppe spielt, und
       so weiter. Im Schweizer System wird diese Rangfolge entsprechend der
       Setzung der Teilnehmer vor dem Turnier bestimmt, unter Berücksichtigung
       einer vorherigen, externen Rangliste. Wir machen das nicht.

    2. Im Schweizer System wird die Anzahl der Male, die ein Spieler gegen einen
       Spieler aus einer anderen Gruppe (mehr Punkte oder weniger Punkte)
       gesetzt wurde ("hochgelost" bzw. "runtergelost"), während des gesamten
       Turniers verfolgt und bei der neuen Setzung berücksichtigt, um die Anzahl
       der Male zu minimieren, in denen ein Spieler außerhalb seiner Gruppe
       spielen muss. Das machen wir nicht.

# Rangliste

1. Die Teilnehmer:innen werden nach ihren Spielpunkten und als zweites Kriterium
   nach ihrer Buchholz-Wertung eingestuft. Die Satzpunkte werden nicht
   berücksichtigt.

2. Wir berechnen die Buchholz-Wertung ein:er Spieler:in als die Summe der Punkte
   ihrer Gegner:innen minus die Summe der Punkte ihrer Partner:innen.

# Edge-Cases

1. **Anzahl der Runden übersteigt Anzahl der Spieler:innen**: Wenn die Anzahl
   der Runden in einem Turnier die Anzahl der Spieler:innen übersteigt, kann
   keine erlaubte Teamzusammenstellung gefunden werden, da jede:r Spieler:in nur
   einmal mit jeder:m anderen Spieler:in als Team zusammengestellt werden kann,
   und bei genügend Runden schließlich alle erlaubten Paarungen ausgeschöpft
   sind. Das Programm wird in diesem Fall scheitern, und die Auslosung der
   weiteren Runden an dieser Stelle blockieren.
