Firmware for Freifunk Bielefeld
===============================

The firmware turns a common wireless router into a mesh networking device.
It connects to similar routers in the area and builds a Wifi-mesh network
but also opens an access point for computers to connect over Wifi.
Included is Internet connectivity and a web interface.

[Precompiled firmware images](http://firmware.freifunk-bielefeld.de/freifunk/firmware/firmware-wizard/ "Precompiled firmware images") are available on our server.
All other released versions here on github are out-of-date.

To build the firmware yourself you need a Unix console to enter commands into.
Install dependencies for the build environment (Debian/Ubuntu):

```bash
    sudo apt install subversion g++ zlib1g-dev build-essential git python
    sudo apt install libncurses5-dev gawk gettext unzip file libssl-dev wget
```
Build commands for the console:

```bash
    git clone https://git.openwrt.org/openwrt/openwrt.git
    cd openwrt
    git reset --hard eed9d40133fe6468cc253d0345c7d7332d2aaa7c
    
    git clone https://github.com/freifunk-bielefeld/firmware.git
    cp -rf firmware/files firmware/package firmware/feeds.conf .
    
    ./scripts/feeds update -a
    ./scripts/feeds install -a
    
    git am --whitespace=nowarn firmware/patches/openwrt/*.patch
    
    cd feeds/routing
    git am --whitespace=nowarn ../../firmware/patches/routing/*.patch
    cd -
    
    rm -rf firmware tmp
    
    make menuconfig
```
Now select the right "Target System" and "Target Profile" for your AP model:

For example, for the TL-WR841ND v3, select:
* `Target System => Atheros AR7xxx/AR9xxx`
* `Target Profile => <*> TP-LINK TL-WR842N/ND v3`

Or in case you have the Ubiquiti UniFi Outdoor, select:
* `Target System => Atheros AR7xxx/AR9xxx`
* `Target Profile => <*> Ubiquiti UniFi Outdoor`

For other models you can lookup the "Target System" in the LEDE
[hardware table](https://lede-project.org/toh/start). Your AP model
should now be visible in the "Target Profile" list.

Now start the build process. This takes some time:

```bash
    make
```
*You have the opportunity to compile the firmware on more CPU Threads. 
E.g. for 4 threads type* `make -j4` .

The **firmware image** files can now be found under the `bin/targets` folder. Use the firmware update functionality of your router and upload the factory image file to flash it with the Freifunk firmware. The sysupgrade images are for updates.

* Use `openwrt-[chip]-[model]-squashfs-factory.bin` for use with the vendor firmware.
* Use `openwrt-[chip]-[model]-squashfs-sysupgrade.bin` for use with OpenWrt based firmware.

**Many routers have not been tested yet, but may work.**
***Give it a try! :-)***
