#Based on gluon-updater
include $(TOPDIR)/rules.mk

PKG_NAME:=autoupdater
PKG_VERSION:=0.1
PKG_RELEASE:=1.1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/autoupdater
  SECTION:=admin
  CATEGORY:=Administration
  DEPENDS:=+opkg +ecdsautils +@BUSYBOX_DEFAULT_SHA512SUM
  TITLE:=Automatically update firmware
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/autoupdater/install
	$(CP) ./files/* $(1)/
	chmod +x $(1)/usr/sbin/autoupdater
endef

$(eval $(call BuildPackage,autoupdater))
