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

Nach der Bestimmung der Doppel-Teams für die nächste Runde werden die Spiele der
neuen Runde entsprechend der gewählten Setzungsmethode gesetzt.

Das Programm unterstützt zwei Optionen für die Setzung der Teams, die vor
Turnierbeginn ausgewählt werden können:

+ Power-Pairing (Schweizer System): Teams werden nach dem "Power Pairing" (auch:
  "Schweizer System") gesetzt: Jedes Team spielt gegen ein Team mit der gleichen
  Punktzahl. Falls dies nicht möglich ist, wird diejenige Setzung gewählt, die
  den Unterschied minimiert. Dies ist die Standardstrategie.

+ Zufällig: Teams werden zufällig gegeneinader gesetzt.

## Power-Pairing Details

In der aktuellen Implementierung gibt es zwei bemerkenswerte Unterschiede zum
Schweizer System:

1. Im Schweizer System wird jede Gruppe "gefaltet", sodass das oberste Mitglied
   einer Gruppe gegen das unterste Mitglied der Gruppe spielt, und so weiter. Im
   Schweizer System wird diese Rangfolge entsprechend der Setzung der Teilnehmer
   vor dem Turnier bestimmt, unter Berücksichtigung einer vorherigen, externen
   Rangliste. Wir machen das nicht.

2. Im Schweizer System wird die Anzahl der Male, die ein Spieler gegen einen
   Spieler aus einer anderen Gruppe (mehr Punkte oder weniger Punkte) gesetzt
   wurde ("hochgelost" bzw. "runtergelost"), während des gesamten Turniers
   verfolgt und bei der neuen Setzung berücksichtigt, um die Anzahl der Male zu
   minimieren, in denen ein Spieler außerhalb seiner Gruppe spielen muss. Das
   machen wir nicht.

# Spelergebnisse

## Gewinnsätze

Vor Turnierbeginn kann die Anzahl der Gewinnsätze konfiguriert werden.

1. Ein Spiel ist gewonnen, wenn ein Team genau die konfigurierte Anzahl von
   Gewinnsätzen erreicht hat, während das gegnerische Team diese Anzahl nicht
   erreicht hat.

2. Spelergebnisse werden eingegeben, indem auf Schaltflächen geklickt wird, die
   die Anzahl der von jedem Team gewonnenen Sätze anzeigen. Anfangs zeigen beide
   Teams "?" (Fragezeichen), was bedeutet, dass noch kein Ergebnis eingegeben
   wurde.

3. Durch Klicken auf eine Schaltfläche wird die Satzzahl für dieses Team erhöht.
   Die Zählung läuft von 0 bis zur Anzahl der Gewinnsätze und springt dann wieder
   auf 0 zurück.

4. Eine Runde kann nicht geschlossen (festgeschrieben) werden, bis alle Spiele
   gültige Ergebnisse haben. Ein gültiges Ergebnis erfordert:

   - Beide Teams haben Satzzahlen eingegeben (keine "?" Werte)
   - Genau ein Team hat die Anzahl der Gewinnsätze erreicht
   - Das andere Team hat diese Anzahl nicht erreicht

5. Die folgenden Situationen sind ungültig und verhindern das Schließen einer
   Runde:
   - **Unentschieden**: Beide Teams haben die Anzahl der Gewinnsätze erreicht
     (z.B. beide haben 3 Sätze bei 3 Gewinnsätzen)
   - **Unvollständig**: Keines der Teams hat die Anzahl der Gewinnsätze erreicht
     (z.B. 2-1 bei 3 Gewinnsätzen)
   - **Teileingabe**: Ein Team hat einen Wert, während das andere noch "?"
     anzeigt

# Rangliste

1. Die Teilnehmer:innen werden nach ihren Spielpunkten, als zweites Kriterium
   nach ihrer Buchholz-Wertung und als drittes Kriterium nach ihren Satzpunkten
   eingestuft.

2. Die Buchholz-Wertung ein:er Spieler:in wird als die Summe der Punkte
   ihrer Gegner:innen minus die Summe der Punkte ihrer Partner:innen berechnet.

3. Satzpunkte werden als Differenz zwischen gewonnenen und verlorenen Sätzen
   über alle abgeschlossenen Spiele berechnet. Für jedes Spiel erhält ein:e
   Spieler:in Satzpunkte gleich der Anzahl der von ihrem Team gewonnenen Sätze
   minus der Anzahl der von ihrem Team verlorenen Sätze.

# Edge-Cases

1. **Anzahl der Runden übersteigt Anzahl der Spieler:innen**: Wenn die Anzahl
   der Runden in einem Turnier die Anzahl der Spieler:innen übersteigt, kann
   keine erlaubte Teamzusammenstellung gefunden werden, da jede:r Spieler:in nur
   einmal mit jeder:m anderen Spieler:in als Team zusammengestellt werden kann,
   und bei genügend Runden schließlich alle erlaubten Paarungen ausgeschöpft
   sind. Das Programm wird in diesem Fall scheitern, und die Auslosung der
   weiteren Runden an dieser Stelle blockieren.
