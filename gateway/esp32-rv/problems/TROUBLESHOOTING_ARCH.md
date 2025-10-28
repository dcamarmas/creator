# Troubleshooting
Logs are generated on the `openocd.log` file.

Sometaimes, you can just unplug, replug and run again, or refresh the GDBGUI
page. If it shows another type of issue, please send it to the official page.
Feedback makes us grow :).


## Error: `gdb_exception_error` -- `libusb_bulk_write error: LIBUSB_ERROR_NO_DEVICE`

This problem happens because the user doesn't have permission to write to
the JTAG USB device, located in `/dev/bus/usb/003/XXX` (where `XXX` is a
pseudo-random number).

You can check this by doing:

```sh
ls -lah /dev/bus/usb/003
```

```sh
total 0
drwxr-xr-x 2 root root      180 Oct  1 11:03 .
drwxr-xr-x 6 root root      120 Oct  1 10:36 ..
crw-rw-r-- 1 root root 189, 256 Oct  1 10:41 001
...
crw-rw-r-- 1 root root 189, 256 Oct  1 10:41 022
```

You can see the user and group are `root`.

To change this, we can configure udev so that, when it mounts the JTAG
device it gives it the group permissions it typically gives to all other
devices (`uucp` for Arch, `dialout` for Ubuntu).

> [!TIP]
> Obviously, you must make sure your user belongs to that group.

> [!TIP]
> To see the device's id, run `lsusb`:
>
> ```
> ...
> Bus 003 Device 022: ID 303a:1001 Espressif USB JTAG/serial debug unit
> ...
> ```
>
> Therefore, the vendor id is `303a`, and the product id is `1001`.

Create a new `/etc/udev/rules.d/99-Espressif.rules` file (with `sudo`!), containing:

```udev
# Set default permisions when mounting Espressif USB JTAG/serial debug unit
# (set to `uucp' usergroup)

SUBSYSTEM=="usb", ENV{DEVTYPE}=="usb_device", ATTRS{idVendor}=="303a", ATTRS{idProduct}=="1001", GROUP="uucp"
```
