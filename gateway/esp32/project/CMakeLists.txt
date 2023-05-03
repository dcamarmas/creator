cmake_minimum_required(VERSION 3.5)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)

idf_component_register(SRCS  "creator-esp32-program.s" "creator-esp32-adaptor.c" "creator-esp32-ecall.s"
                       INCLUDE_DIRS "")
