#!/bin/sh

#Everything in /etc/uci-defaults will be 
#deleted the first time OpenWRT starts.

#disable telnet access
/etc/init.d/telnet disable

#set empty password for root
(echo ""; sleep 1; echo "") | passwd
