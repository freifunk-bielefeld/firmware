include $(TOPDIR)/rules.mk

PKG_NAME:=freifunk
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/freifunk

include $(INCLUDE_DIR)/package.mk

define Package/freifunk-basic
	SECTION:=base
	CATEGORY:=Freifunk
	DEFAULT:=y
	TITLE:= Freifunk-Bielefeld Basic
	URL:=http://freifunk-bielefeld.de
	DEPENDS:=+kmod-batman-adv +alfred \
		+uhttpd +haserl +uhttpd-mod-tls +px5g \
		+ip +odhcpd +simple-radvd +zerotier \
		+ebtables +kmod-ebtables-ipv4 +kmod-ebtables-ipv6 \
		+haveged +autoupdater +simple-tc +@ATH_USER_REGD
endef

define Build/Prepare
	echo "all: " > $(PKG_BUILD_DIR)/Makefile
endef

define Package/freifunk-basic/install
	#nothing to do here
endef

define Package/freifunk/conffiles
	/etc/config/freifunk
endef

define Package/freifunk-debug
	SECTION:=base
	CATEGORY:=Freifunk
	DEFAULT:=n
	TITLE:=With debug tools
	DEPENDS:=+freifunk-basic \
		+@KMOD_BATMAN_ADV_DEBUG_LOG +iperf +tcpdump-mini
endef

define Package/freifunk-usb-storage
	SECTION:=base
	CATEGORY:=Freifunk
	DEFAULT:=n
	TITLE:=With USB storage packages
	DEPENDS:=+freifunk-basic \
		+kmod-usb-storage +block-mount \
		+block-hotplug +kmod-fs-ext4 +kmod-fs-vfat \
		+kmod-nls-cp437 +kmod-nls-iso8859-1
endef

define Package/freifunk-usb-3g
	SECTION:=base
	CATEGORY:=Freifunk
	DEFAULT:=n
	TITLE:=With 3G USB dongle packages
	DEPENDS:=+freifunk-basic \
	+comgt +kmod-usb-serial +kmod-usb-serial-option \
	+kmod-usb-serial-wwan +usb-modeswitch \
	+usb-modeswitch-data
endef

$(eval $(call BuildPackage,freifunk-basic))
$(eval $(call BuildPackage,freifunk-debug))
$(eval $(call BuildPackage,freifunk-usb-storage))
$(eval $(call BuildPackage,freifunk-usb-3g))
