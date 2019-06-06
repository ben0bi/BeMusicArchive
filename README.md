# BeMusicArchive

Benobis Music Archive Software

(A directory listing with file upload capabilities for the browser.)

Also shows the cover images from mp3-files.

Just put it somewhere on your server where the browser can reach.

Uncomment the commented two lines in index.php to see the
password-hash when you input "your" new password.
Then comment it again and change the password
and the file directories in config/pageconfig.json

Finally, "chmod 777 *" or "chmod www-data:www-data *" for just about
everything in the FILESYS-directory.

Don't forget to change the upload filesize and the post-size in your
php-config. It is 2MB by default, that is not enough.
