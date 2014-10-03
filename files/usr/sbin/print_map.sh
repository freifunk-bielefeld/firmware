#!/bin/sh

#Print out local connection data for map creation

version="$(uci get -q freifunk.@settings[0].version 2> /dev/null)"
name="$(uci get -q freifunk.@settings[0].name 2> /dev/null)"
geo="$(uci get -q freifunk.@settings[0].geo 2> /dev/null)"

echo -n "{"

[ -n "$geo" ] && echo -n "\"geo\" : \"$geo\", "
[ -n "$name" ] && echo -n "\"name\" : \"$name\", "
[ -n "$version" ] && echo -n "\"firmware\" : \"ffbi-$version\", "

echo -n "\"links\" : ["

printLink() { echo -n "{ \"smac\" : \"$(cat /sys/class/net/$3/address)\", \"dmac\" : \"$1\", \"qual\" : $2 }"; }
IFS="
"
nd=0
for entry in $(cat /sys/kernel/debug/batman_adv/bat0/originators |  tr '\t/[]()' ' ' |  awk '{ if($1==$4) print($1, $3, $5) }'); do
  [ $nd -eq 0 ] && nd=1 || echo -n ", "
  IFS=" "
  printLink $entry
done

echo -n '], '
mac=$(uci get -q network.public.macaddr)
cat /sys/kernel/debug/batman_adv/bat0/transtable_local | tr '\t/[]()' ' ' | awk -v mac=$mac 'BEGIN{ c=0; } { if($1 == "*" && $2 != mac && $4 ~ /^[.NW]+$/ && $5 < 300) c++;} END{ printf("\"clientcount\" : %d", c);}'
echo -n '}'
