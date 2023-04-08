execute at @s anchored eyes run {
    execute unless block ^^^.25 air run {
        setblock ~~~ diamond_block
    }
    execute positioned ^^^.25 if block ~~~ air repeat
}