#
# Copyright (C) 2013 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#
include $(TOPDIR)/rules.mk

PKG_NAME:=masala
PKG_VERSION:=0.1
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/masala
	SECTION:=net
	CATEGORY:=Network
	TITLE:=P2P DNS Server
	DEPENDS:=+libpolarssl +libpthread
	SUBMENU:=IP Addresses and Names
endef

define Package/masala/description
	P2P name resolution daemon
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	git clone https://github.com/mwarning/masala.git $(PKG_BUILD_DIR)
endef

define Package/masala/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/masala $(1)/usr/bin/

	$(INSTALL_DIR) $(1)/etc/init.d/
	$(INSTALL_BIN) files/masala.init $(1)/etc/init.d/masala
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) files/masala.config $(1)/etc/config/masala
endef

$(eval $(call BuildPackage,masala))
