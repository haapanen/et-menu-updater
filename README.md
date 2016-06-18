# Menu updater

A simple app that polls menu directory and moves any changed files to the client directory.

Usage:

Compile the application with typescript compiler:

`tsc`

Run the application:

`node ./Application.js <watch dir> <client dir>`

If no parameters are given, uses the previously used parameters.

NOTE:

In order to use the application the .pk3 file must not contain any .menu files and `sv_pure 0` must be used.