#Based on gluon-next-node
include $(TOPDIR)/rules.mk

PKG_NAME:=next-node
PKG_VERSION:=1
PKG_RELEASE:=1.1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/next-node
  SECTION:=gluon
  CATEGORY:=Gluon
  TITLE:=Next-node anycast address
  DEPENDS:=+ebtables +kmod-batman-adv +ip +kmod-macvlan
endef

define Package/next-node/description
	Gluon community wifi mesh firmware framework: next-node anycast address
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/next-node/install
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,next-node))
