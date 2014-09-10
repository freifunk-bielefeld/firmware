##Firmware for Freifunk Herford

The firmware turns a common wireless router into a mesh networking device.
It connects to similar routers in the area and builds a Wifi-mesh network
but also opens an access point for computers to connect over Wifi.
Included is Internet connectivity and a web interface.

To build the firmware you need a Unix console to enter commands into.
Install dependencies for the build environment (Debian/Ubuntu):

<pre>
sudo apt-get install git subversion g++ libncurses5-dev gawk zlib1g-dev build-essential
</pre>

Build Commands:

<pre>
git clone git://git.openwrt.org/12.09/openwrt.git
cd openwrt

git clone -b herford https://github.com/freifunk-bielefeld/firmware.git
cp -rf firmware/{files,package,feeds.conf.default,.config} .
git am --whitespace=nowarn firmware/patches/*.patch
rm -rf firmware

./scripts/feeds update -a
./scripts/feeds install -a

make defconfig
make menuconfig
</pre>

Now select the right "Target System" and "Target Profile" for your AP model:

For example, for the TL-WR841ND, select:
* Target System => Atheros AR7xxx/AR9xxx
* Target Profile => TP-LINK TL-WR841ND

Or in case you have the DIR-300, select:
* Target System => <*> AR231x/AR5312
* Target Profile => <*> Default

For other models you can lookup the "Target System" in the OpenWrt
[hardware table](http://wiki.openwrt.org/toh/start). Your AP model
should now be visible in the "Target Profile" list.

Now start the build process. This takes some time:

<pre>
make
</pre>

The firmware images are now in the "bin"-folder. Use the firmware update
functionality of your router and upload the factory image. The sysupgrade
images are for further updates.

* Use "openwrt-[chip]-[model]-squashfs-factory.bin" for the initial flash.
* Use "openwrt-[chip]-[model]-squashfs-sysupgrade.bin" for futher updates.

Many routers have not been tested yet, but may work.
Give it a try! :-)
