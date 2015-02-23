Firmware for Freifunk Bielefeld
=========================

The firmware turns a common wireless router into a mesh networking device.
It connects to similar routers in the area and builds a Wifi-mesh network
but also opens an access point for computers to connect over Wifi.
Included is Internet connectivity and a web interface.

To build the firmware you need a Unix console to enter commands into.
Install dependencies for the build environment (Debian/Ubuntu):

    sudo apt-get install subversion g++ zlib1g-dev build-essential
    sudo apt-get install git libncurses5-dev gawk gettext unzip file

Build commands for the console:

    git clone git://git.openwrt.org/14.07/openwrt.git
    cd openwrt
    
    ./scripts/feeds update -a
    ./scripts/feeds install -a
    
    git clone https://github.com/freifunk-bielefeld/firmware.git
    cp -rf firmware/files firmware/package .
    git am --whitespace=nowarn firmware/patches/openwrt/*.patch
    cd feeds/routing && git am --whitespace=nowarn ../../firmware/patches/routing/*.patch && cd -
    cd feeds/packages && git am --whitespace=nowarn ../../firmware/patches/packages/*.patch && cd -
    rm -rf firmware tmp
    
    make defconfig
    make menuconfig

Now select the right "Target System" and "Target Profile" for your AP model:

For example, for the TL-WR841ND, select:
* `Target System => Atheros AR7xxx/AR9xxx`
* `Target Profile => TP-LINK TL-WR841ND`

Or in case you have the DIR-300, select:
* `Target System => <*> AR231x/AR5312`
* `Target Profile => <*> Default`

For other models you can lookup the "Target System" in the OpenWrt
[hardware table](http://wiki.openwrt.org/toh/start). Your AP model
should now be visible in the "Target Profile" list.

Now start the build process. This takes some time:

    make

The firmware images are now in the `bin`-folder. Use the firmware update
functionality of your router and upload the factory image. The sysupgrade
images are for further updates.

* Use `openwrt-[chip]-[model]-squashfs-factory.bin` for the initial flash.
* Use `openwrt-[chip]-[model]-squashfs-sysupgrade.bin` for futher updates.

Many routers have not been tested yet, but may work.
Give it a try! :-)
