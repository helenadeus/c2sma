<?php
$a = levenshtein ("Adenosine-3',5'-monophosphate-8-Chloro (8-Chloro-cAMP)", "8-Chloro-cAMP");
$b = levenshtein ("Adenosine-3',5'-monophosphate-8-Chloro (8-Chloro-cAMP)", "Adenosine");

echo $a.' '.$b;

?>