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

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)/
PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=git://github.com/mwarning/masala.git
PKG_SOURCE_VERSION:=master
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

define Package/masala
	SECTION:=net
	CATEGORY:=Network
	TITLE:=P2P DNS Server
	DEPENDS:=+libpthread
	SUBMENU:=IP Addresses and Names
	URL:=https://github.com/mwarning/masala
endef

define Package/masala/description
	P2P name resolution daemon
endef

MAKE_FLAGS += FEATURES="dns cmd"

define Package/masala/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/masala $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/masala-ctl $(1)/usr/bin/

	$(INSTALL_DIR) $(1)/etc/init.d/
	$(INSTALL_BIN) files/masala.init $(1)/etc/init.d/masala
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) files/masala.config $(1)/etc/config/masala
endef

$(eval $(call BuildPackage,masala))
