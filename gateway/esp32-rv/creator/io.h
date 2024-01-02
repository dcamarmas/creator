/*
 *  Copyright 2018-2024 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso, José Antonio Verde Jiménez
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/** @file      io.h
 *  @brief     Input Output Interface for Creator
 *  @author    José Antonio Verde Jiménez
 *  @copyright Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso, José Antonio Verde Jiménez
 * 
 *  This file provides a common interface for routines for input and output.
 *  The implementation is written in assembly and might change depending on the
 *  device. But the interface is the same.
 */

#ifndef __CREATOR_IO_HPP
#define __CREATOR_IO_HPP

/** @defgroup Creator_Input  Input routines for Creator
 *  @brief Input routines for Creator
 *
 *  Functions get_character(), peek_character() and get_string(), use an
 *  internal buffer so editing is possible. A line feed or carriage return is
 *  needed to continue.
 *
 *  @{
 */

/** Read a character from standard input immediately. Don't show the character
 *  on screen. This function doesn't work well along get_character(),
 *  peek_character() or get_string(), because they need to write to a buffer to
 *  work well.
 *
 *  @return
 *  Returns a character between 0 and 255 on success.
 *  It returns -1 on error or when EOF is reached.
 */
int get_immediate ();

/** Read a character from standard input. It echos the character.
 *
 *  @return
 *  Returns a character between 0 and 255 on success.
 *  It returns -1 on error or when EOF is reached.
 */
int get_character ();

/** Peek on the next character on the standard input, but don't read it. That
 *  way you can see the next character without "destroying it".
 *
 *  @return
 *  Returns a character between 0 and 255 on success.
 *  It returns -1 on error or when EOF is reached.
 */
int peek_character ();

/** Read from standard input into a string buffer. The last character is
 *  written to be '\0'.
 *
 *  This function supposes that the length of the string is *at least*,
 *  length + 1 characters long. string[length] will be 0.
 *
 *  Note that carriage returns, line feeds and carriage return + line feed are
 *  all treated like line feeds.
 *
 *  @param[out] string
 *  A pointer to the begining of the string buffer.
 *
 *  @param[in] length
 *  The amount of characters to be read from standard input.
 */
void get_string (char *string, int length);

/** @} */

/** @defgroup Creator_Output  Output routines for Creator
 *  @brief Output routines for Creator
 *
 *  @{
 */


/** Write a character immediately (flush and synchronise it) on standard output
 *  and display it on the screen.
 *
 *  @param[in] c
 *  A character.
 */
void put_immediate (char c);

/** Write a character zero-terminated string on standard output, flush and
 *  synchronise standard output and display it on the screen.
 *
 *  @param[in] string
 *  The pointer to the begining of the string.
 */
void put_zstring (char *string);

/** Write a string with a given length on standard output, flush and
 *  synchronise standard output and display it on the screen.
 *
 *  @param[in] string
 *  The pointer to the begining of the string.
 *
 *  @param[in] length
 *  The length of said string
 */
void put_string (char *string, int length);

/** @} */

#endif//__CREATOR_IO_HPP
