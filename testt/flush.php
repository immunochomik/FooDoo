<?php
/**
 * Created by PhpStorm.
 * User: tomek
 * Date: 30/06/16
 * Time: 20:35
 */

if (ob_get_level() == 0) ob_start();

for ($i = 0; $i<10; $i++){

    echo "$i Line to show.</br>";
    echo str_pad('',4096)."\n";

    ob_flush();
    flush();
    sleep(2);
}

echo "Done.";

ob_end_flush();

