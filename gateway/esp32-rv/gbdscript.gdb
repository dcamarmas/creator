delete breakpoints
target extended-remote :3333
set remotetimeout 10
monitor reset halt          
maintenance flush register-cache
b main
continue

define hook-stop
    set $inst = *(unsigned int *)$pc
    if $inst == 0x00000073
        set $next = $pc + 4
        tbreak *$next
        continue
    end
end
