include $(TOPDIR)/rules.mk

PKG_NAME:=freifunk-bielefeld
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/freifunk-bielefeld-$(PKG_VERSION)
PKG_SOURCE:=freifunk-bielefeld-$(PKG_VERSION).tar.gz
PKG_MD5SUM:=	
PKG_CAT:=zcat

include $(INCLUDE_DIR)/package.mk

define Package/freifunk-bielefeld-basic
  SECTION:=base
  CATEGORY:=Config
  DEFAULT:=y
  TITLE:= Freifunk-Bielefeld Basic
  #DESCRIPTION:=This variable is obsolete. use the Package/name/description define instead!
  URL:=http://freifunk-bielefeld.de
  DEPENDS:=+kmod-batman-adv +nodogsplash +n2n +uhttpd +fping +haserl
endef

define Package/freifunk-bielefeld-basic-ath9k
  SECTION:=base
  CATEGORY:=Config
  DEFAULT:=n
  TITLE:=Freifunk-Bielefeld Basic Ath9k
  URL:=http://freifunk-bielefeld.de
  DEPENDS:= +freifunk-bielefeld-basic +hostapd +kmod-ath9k
endef

define Package/freifunk-bielefeld-OpenRD-max
  SECTION:=base
  CATEGORY:=Config
  DEFAULT:=n
  TITLE:=Freifunk-Bielefeld OpenRD-Base max-features (without Basic)
  DEPENDS:= +nano +htop
endef

$(eval $(call BuildPackage,freifunk-bielefeld-basic))
$(eval $(call BuildPackage,freifunk-bielefeld-basic-ath9k))
$(eval $(call BuildPackage,freifunk-bielefeld-OpenRD-max))
