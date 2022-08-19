# aidoku-komga-as
A Komga package for Aidoku.

# **Notice**

*This is not an official, Aidoku-endorsed source for Komga.* An official one is currently in the works, but this is a viable solution for those who still want to use Komga while the official package is in private development. Also, do not expect this code to be used officially, since the Aidoku team has announced that they will only accept packages written in Rust going forward.

# How to Install
1. Install the Aidoku client command line tool from this [repository](https://github.com/Aidoku/aidoku-cli).

2. Clone this repo:

```
$ git clone https://github.com/OmerFlame/aidoku-komga-as.git
$ cd aidoku-komga-as
```

3. Compile:

```
$ npm install --save
$ npm run build
```

4. Serve the package using a local Aidoku source server:

```
$ cd build
$ aidoku serve package.aix
```

5. In Aidoku, go to the settings tab, add a new source server and type the IP and port that Aidoku has provided to you in the last step.
**Note:** After finishing the installation, the package will be able to function without the local Aidoku server being online.

6. Go to the Browse tab, refresh the list and tap "Get" on the Komga tab that appears.

From this point forward, the Aidoku server can be turned off indefinitely.

7. Choose Komga in the list of installed sources, go to the settings at the top right, enter your Komga account credentials, exit the settings, reload the page and you're done!

# Reporting Bugs

If you manage to find a bug in this source, please open up an issue, and I will try to answer as fast as I can.
