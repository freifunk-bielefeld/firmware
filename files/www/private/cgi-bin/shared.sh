#!/bin/sh

count() { echo $#; }
strip() { echo "$@"; }
ssort() { strip `echo "$@" | tr ' ' '\n' | sort | tr '\n' ' '`; }
ssort_uniq() { strip `echo "$@" | tr ' ' '\n' | sort | uniq | tr '\n' ' '`; }

#get JSON representation of a settings item
export_json()
{
    local config=$1
    local section=$2
    echo -n "{ "
    local c=0; IFS="
"
    for line in `uci -q show $config.$section | tail -n +2`; do
        local value=${line##*=}
        local name=${line%%=*}
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
    local config=$1
    local section=$2
    local env_str=$3
    local allowed=$4
    
    for line in `echo -n "$env_str" | sed  "/^GET_${section}_.*/!d"`; do
        local value=${line##*=}
        local name=${line%%=*}
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
    local tmp=`echo -n "$1" | grep -c '^[0-9a-zA-Z_]*$'`
    [ $tmp -ne 1 ] && {
        echo "(E) Name '$1' ist invalid."
        exit 1
    }
}

valid_entry() {
    local tmp=`uci get -q $1`
    [ "$tmp" != "$2" -o -z $1 ] && {
        #Entry does not exists
        echo "(E) Eintrag '$1' existiert nicht."
        exit 1
    }
}

del_item()
{
    local items=$1
    local ex=$2
    
    local ns=""
    for item in $items; do
        [ "$item" = "$ex" ] && continue
        ns="$ns $item"
    done
    echo $ns
}

uci_del_from_list() {
    local tmp=`uci get -q $1`
    tmp=`del_item "$tmp" "$2"`
    [ -z "$tmp" ] && tmp=" "
    uci set -q $1="$tmp"
}

uci_add_to_list() {
    local tmp=`uci get -q $1`
    tmp=`ssort_uniq "$tmp" "$2"`
    [ -z "$tmp" ] && tmp=" "
    uci set -q $1="$tmp"
}
