#!/bin/sh

count() { echo $#; }
strip() { echo "$@"; }
ssort() { strip `echo "$@" | tr ' ' '\n' | sort | tr '\n' ' '`; }
ssort_uniq() { strip `echo "$@" | tr ' ' '\n' | sort | uniq | tr '\n' ' '`; }

#get JSON representation of a settings item
export_json()
{
    config=$1
    section=$2
    echo -n "{ "
    c=0; IFS="
"
    for line in `uci -q show $config.$section | tail -n +2`; do
        value=${line##*=}
        name=${line%%=*}
        name=${name##*.}
       
        [ $c -eq 1 ] && echo -n ", " || c=1
       
        echo -n "\"$name\" : \"$value\""
    done
    echo -n " }"
    unset IFS
}

#GET_foo_bar=42 => uci set -q ham.foo.bar="42"
import_settings()
{
    config=$1
    section=$2
    env_str=$3
    allowed=$4
    
    for line in `echo -n "$env_str" | sed  "/^GET_${section}_.*/!d"`; do
        value=${line##*=}
        name=${line%%=*}
        name=${name##GET_${section}_}
        [ -n "$allowed" ] && case "$allowed" in
          *"$name"*) ;;
            *) continue ;;
        esac
        [ -z "$value" ] && value=" "
        uci set -q $config.$section.$name="$value"
    done
}

valid_name() {
    tmp=`echo -n "$1" | grep -c '^[0-9a-zA-Z_]*$'`
    [ $tmp -ne 1 ] && {
        echo "(E) Name '$1' is invalid."
        exit 1
    }
}

valid_entry() {
    tmp=`uci get -q $1`
    [ "$tmp" != "$2" -o -z $1 ] && {
        echo "(E) Entry '$1' does not exist."
        exit 1
    }
}

del_item()
{
    items=$1
    ex=$2
    
    ns=""
    for item in $items; do
        [ "$item" = "$ex" ] && continue
        ns="$ns $item"
    done
    echo $ns
}

uci_del_from_list() {
    tmp=`uci get -q $1`
    tmp=`del_item "$tmp" "$2"`
    [ -z "$tmp" ] && tmp=" "
    uci set -q $1="$tmp"
}

uci_add_to_list() {
    tmp=`uci get -q $1`
    tmp=`ssort_uniq "$tmp" "$2"`
    [ -z "$tmp" ] && tmp=" "
    uci set -q $1="$tmp"
}
