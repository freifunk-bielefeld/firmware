#Based on gluon-simple-tc
include $(TOPDIR)/rules.mk

PKG_NAME:=simple-tc
PKG_VERSION:=1
PKG_RELEASE:=1.1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/simple-tc
  SECTION:=admin
  CATEGORY:=Administration
  TITLE:=Bandwidth limit support
  DEPENDS:=+tc +kmod-sched
endef

define Package/simple-tc/description
	Simple support for upload and download limits
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/simple-tc/install
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,simple-tc))
