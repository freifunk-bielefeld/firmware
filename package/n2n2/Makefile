#
# Copyright (C) 2007-2011 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_BRANCH:=trunk
PKG_SOURCE_URL:=https://ntop.org/svn/ntop/trunk/n2n/n2n_v2/
PKG_REV:=5055

PKG_NAME:=n2n2
PKG_VERSION:=$(PKG_REV)
PKG_RELEASE:=4

PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE:=$(PKG_SOURCE_SUBDIR).tar.gz
PKG_SOURCE_PROTO:=svn
PKG_SOURCE_VERSION:=$(PKG_REV)

include $(INCLUDE_DIR)/package.mk

define Package/n2n2
  SECTION:=net
  CATEGORY:=Network
  TITLE:=VPN tunneling daemon
  URL:=http://www.ntop.org/n2n/
  SUBMENU:=VPN
  DEPENDS:=+libpthread +kmod-tun +CONFIG_N2N_AES_ENCRYPTION:libopenssl
endef

define Package/n2n2/config
	source "$(SOURCE)/Config.in"
endef


MAKE_VARS += \
  INSTALL_PROG=":" \
  LIBS_EDGE="$(TARGET_LDFLAGS)" \
  LIBTOOL="$(STAGING_DIR)/host/bin/libtool" \
  $(if $(CONFIG_N2N_AES_ENCRYPTION),,N2N_OPTION_AES=no)

define Package/n2n2/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/edge $(1)/usr/sbin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/supernode $(1)/usr/sbin/
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DATA) ./files/n2n.config $(1)/etc/config/n2n
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/n2n.init $(1)/etc/init.d/n2n
endef

define Package/n2n2/conffiles
/etc/config/n2n
endef

$(eval $(call BuildPackage,n2n2))


