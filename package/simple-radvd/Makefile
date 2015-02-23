include $(TOPDIR)/rules.mk

#This package is identical to the gluon-radvd package from the Gluon Project

PKG_NAME:=simple-radvd
PKG_VERSION:=3

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/simple-radvd
  SECTION:=net
  CATEGORY:=Network
  TITLE:=Advertise an IPv6 prefix from the node
  DEPENDS:=+librt
endef

define Package/simple-radvd/description
	Advertise an IPv6 prefix from the node
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
	CFLAGS="$(TARGET_CFLAGS)" CPPFLAGS="$(TARGET_CPPFLAGS)" $(MAKE) -C $(PKG_BUILD_DIR) $(TARGET_CONFIGURE_OPTS)
endef

define Package/simple-radvd/install
	$(CP) ./files/* $(1)/
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/simple-radvd $(1)/usr/sbin/
endef

$(eval $(call BuildPackage,simple-radvd))
