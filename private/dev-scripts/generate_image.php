<?php
$img = imagecreatetruecolor(300, 300);
$bg = imagecolorallocate($img, 0, 0, 255);
imagefill($img, 0, 0, $bg);
imagejpeg($img, 'test_square.jpg');
imagedestroy($img);
echo "Image created: test_square.jpg\n";
