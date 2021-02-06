/*
 *  Copyright 2018-2021 Felix Garcia Carballeira, Alejandro Calderon Mateos, Diego Camarmas Alonso
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


function bi_intToBigInt ( int_value, int_base )
{
	var auxBigInt = null ;

	if (typeof bigInt !== "undefined" && int_base == 16)
		auxBigInt = bigInt(int_value, int_base).value ;

	else if (typeof bigInt !== "undefined")
		auxBigInt = bigInt(parseInt(int_value) >>> 0, int_base).value ;

	else auxBigInt = BigInt(parseInt(int_value) >>> 0, int_base) ;

	return auxBigInt ;
}


/*String to Bigint number*/
function bigInt_deserialize(object)
{
	var auxObject = object;

	for (var i=0; i<auxObject.components.length; i++)
	{
		var aux = null ;
		var auxBigInt = null ;

		if (auxObject.components[i].type != "floating point")
		{
			for (var j = 0; j < auxObject.components[i].elements.length; j++)
			{
				aux = auxObject.components[i].elements[j].value;
				auxObject.components[i].elements[j].value = bi_intToBigInt(aux,10) ;

				if (auxObject.components[i].double_precision != true)
				{
					aux = auxObject.components[i].elements[j].default_value;
					auxObject.components[i].elements[j].default_value = bi_intToBigInt(aux,10) ;
				}
			}
		}
	}

	return auxObject;
}

/*Bigint number to string*/
function bigInt_serialize(object)
{
	var auxObject = jQuery.extend(true, {}, object);

	for (var i=0; i<architecture.components.length; i++)
	{
		if (architecture.components[i].type != "floating point")
	   	{
		   for (var j = 0; j < architecture.components[i].elements.length; j++)
			{
				var aux = architecture.components[i].elements[j].value;
				auxObject.components[i].elements[j].value = Number(aux);

				if (architecture.components[i].double_precision != true)
				{
					var aux = architecture.components[i].elements[j].default_value;
					auxObject.components[i].elements[j].default_value = Number(aux);
				}
		   }
		}
	}

	return auxObject;
}
