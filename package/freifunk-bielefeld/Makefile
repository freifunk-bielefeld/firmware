include $(TOPDIR)/rules.mk

PKG_NAME:=freifunk-bielefeld
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/freifunk

include $(INCLUDE_DIR)/package.mk

define Package/freifunk-bielefeld-basic
	SECTION:=base
	CATEGORY:=Config
	DEFAULT:=y
	TITLE:= Freifunk-Bielefeld Basic
	URL:=http://freifunk-bielefeld.de
	DEPENDS:=+kmod-batman-adv +batctl +nodogsplash +uhttpd \
		+haserl +@BUSYBOX_DEFAULT_TUNCTL +uhttpd-mod-tls \
		+px5g +fastd +dnsmasq-dhcpv6 +kmod-ipv6 \
		+ip6tables +ebtables +kmod-ebtables-ipv4 \
		+kmod-ebtables-ipv6 +ip +odhcpd +haveged \
		+autoupdater +next-node +simple-tc
endef

define Build/Prepare
	echo "all: " > $(PKG_BUILD_DIR)/Makefile
endef

define Package/freifunk-bielefeld-basic/install
	#nothing to do here
endef

define Package/freifunk-bielefeld/conffiles
	/etc/config/freifunk
endef

define Package/freifunk-bielefeld-debug
	SECTION:=base
	CATEGORY:=Config
	DEFAULT:=n
	TITLE:=Freifunk-Bielefeld with debug tools
	DEPENDS:=+freifunk-bielefeld-basic \
		+@KMOD_BATMAN_ADV_DEBUG_LOG +iperf +tcpdump-mini
endef

$(eval $(call BuildPackage,freifunk-bielefeld-basic))
$(eval $(call BuildPackage,freifunk-bielefeld-debug))
