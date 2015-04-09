include $(TOPDIR)/rules.mk

PKG_NAME:=freifunk-base
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/freifunk-base-basic
	SECTION:=base
	CATEGORY:=Config
	DEFAULT:=y
	TITLE:=Freifunk Base
	URL:=http://freifunk-bielefeld.de
	DEPENDS:=+kmod-batman-adv +alfred +sockread\
		+uhttpd +haserl +uhttpd-mod-tls +px5g \
		+fastd +ip +odhcpd +simple-radvd \
		+ebtables +kmod-ebtables-ipv6 \
		+haveged +autoupdater +simple-tc +@ATH_USER_REGD
endef

define Build/Prepare
	echo "all: " > $(PKG_BUILD_DIR)/Makefile
endef

define Package/freifunk-base-basic/install
	$(CP) ./files/* $(1)/
endef


define Package/freifunk-base-debug
	SECTION:=base
	CATEGORY:=Config
	DEFAULT:=n
	TITLE:=Freifunk Base with debug tools
	DEPENDS:=+freifunk-base-basic \
		+@KMOD_BATMAN_ADV_DEBUG_LOG +iperf +tcpdump-mini
endef

$(eval $(call BuildPackage,freifunk-base-basic))
$(eval $(call BuildPackage,freifunk-base-debug))
