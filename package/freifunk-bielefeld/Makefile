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
	DEPENDS:=+freifunk-base-basic
endef

define Build/Prepare
	echo "all: " > $(PKG_BUILD_DIR)/Makefile
endef

define Package/freifunk-bielefeld-basic/install
	$(CP) ./files/* $(1)/
endef

define Package/freifunk-bielefeld/conffiles
	/etc/config/freifunk
endef

define Package/freifunk-bielefeld-debug
	SECTION:=base
	CATEGORY:=Config
	DEFAULT:=n
	TITLE:=Freifunk-Bielefeld with debug tools
	DEPENDS:=+freifunk-bielefeld-basic +freifunk-base-debug
endef

$(eval $(call BuildPackage,freifunk-bielefeld-basic))
$(eval $(call BuildPackage,freifunk-bielefeld-debug))
