const {timeout_send, delay} = require('../util/funcs');
const {group_study_area_code, header_referer} = require('../util/variables');

const axios = require('axios');
const qs = require('qs');


const lib_route = 'https://libcal.library.umass.edu'

const grid_route = lib_route + '/spaces/availability/grid'

/*
start: 2022-01-29
end: 2022-01-30
*/
const grid_post_format = (start, end) =>{
    return qs.stringify({
        lid:11076,
        gid:28495,
        eid: -1,
        seat: 0,
        seatId: 0,
        zone: 0,
        accessible: 0,
        powered: 0,
        'start': start,
        'end': end,
        pageIndex: 0,
        pageSize: 18,
    })
}

const add_route = lib_route + '/spaces/availability/booking/add'

/*
elementID: 107628
add[start]: 2022-01-29 10:00
add[checksum]: d380c5deebdc4863f8af9dfa4fdce9a9
start: 2022-01-29
end: 2022-01-30
*/
const add_post_format = (elementID, add_start, checksum, start, end) => {
    return qs.stringify({
        'add[eid]': elementID,
        'add[gid]': 28495,
        'add[lid]': 11076,
        'add[start]': add_start,
        'add[checksum]':checksum,
        'lid': 11076,
        'gid': 28495,
        'start': start,
        'end': end,
        'session': 0,
    })
}


/*
'update[id]': 20603977 = 'bookings[0][id]': 20603977
'update[checksum]': '44dba93d1ef61e54816df67382416209',
'update[end]': 2022-01-28 14:00:00,
'start': 2022-01-28,
'end': 2022-01-29,
'bookings[0][start]': 2022-01-28 12:00,
'bookings[0][end]': 2022-01-28 13:00,
'bookings[0][checksum]': 'ac3cf82d9563ef95f3990b4de5ce3317',
*/
const add2_post_format = (
    id, 
    update_checksum, 
    update_end, 
    start, 
    end, 
    session, 
    elementID,
    booking_start,
    booking_end,
    booking_checksum,
)=>{
    return qs.stringify({
        'update[id]': id,
        'update[checksum]': update_checksum,
        'update[end]': update_end,
        'lid': 11076,
        'gid': 28495,
        'start': start,
        'end': end,
        'session': session,
        'bookings[0][id]': id,
        'bookings[0][eid]': elementID,
        'bookings[0][seat_id]': 0,
        'bookings[0][gid]': 28495,
        'bookings[0][lid]': 11076,
        'bookings[0][start]': booking_start,
        'bookings[0][end]': booking_end,
        'bookings[0][checksum]': booking_checksum,
    })
}


const book_route = lib_route + '/ajax/space/book'


/*
formData[fname]: Chang
formData[lname]: Zeng
formData[email]: zc470618625@gmail.com
session: 12239928
bookings[0][id]: 20604948
bookings[0][eid]: 107629
bookings[0][start]: 2022-01-28 13:00
bookings[0][end]: 2022-01-28 15:00
bookings[0][checksum]: 6db6a41a91156c3bc276a637a5983510
*/
const book_post_format = (
    fname, 
    lname, 
    email, 
    session, 
    book_id, 
    elementID,
    booking_start,
    booking_end,
    booking_checksum,
) => {
    return qs.stringify({
        'formData[fname]': fname,
        'formData[lname]': lname,
        'formData[email]': email,
        'formData[q12479]': 'Undergraduate',
        'formData[q12481]': '3-5',
        'formData[q12482]': 'Yes',
        'formData[q12477]': 'CS',
        'forcedEmail': '',
        'session': session,
        'bookings[0][id]': book_id,
        'bookings[0][eid]': elementID,
        'bookings[0][seat_id]': 0,
        'bookings[0][gid]': 28495,
        'bookings[0][lid]': 11076,
        'bookings[0][start]': booking_start,
        'bookings[0][end]': booking_end,
        'bookings[0][checksum]': booking_checksum,
        returnUrl: '/spaces?lid=11076&gid=28495&c=0',
        method: 11,
    })
}


async function get_slots(start, end){
	// return grid_response_example()
	return await axios.post(grid_route, grid_post_format(start, end), header_referer)
	.then((res) => {
		return res.data.slots
	})
	.catch((error) => {
		console.log(error)
		return []
	})
}


async function add_slot(elementID, add_start, checksum, start, end){
	return await axios.post(add_route, add_post_format(elementID, add_start, checksum, start, end), header_referer)
	.then((res) => {
		return res.data
	})
	.catch((error) => {
		console.log(error)
		return []
	})
}


async function add_second_slot(
	id, 
	update_checksum, 
	update_end, 
	start, 
	end, 
	session, 
	elementID,
	booking_start,
	booking_end,
	booking_checksum,
){
	return await axios.post(add_route, add2_post_format(
														id, 
														update_checksum, 
														update_end, 
														start, 
														end, 
														session, 
														elementID,
														booking_start,
														booking_end,
														booking_checksum,
													), header_referer)
	.then((res) => {
		return res.data
	})
	.catch((error) => {
		console.log(error)
		return []
	})
}


async function book_slots(
	fname, 
    lname, 
    email, 
    session, 
    book_id, 
    elementID,
    booking_start,
    booking_end,
    booking_checksum,
){
	return await axios.post(book_route, book_post_format(
														fname, 
														lname, 
														email, 
														session, 
														book_id, 
														elementID,
														booking_start,
														booking_end,
														booking_checksum,
													), header_referer)
	.then((res) => {
		return res.data
	})
	.catch((error) => {
		console.log(error)
		return []
	})
}


function nextDayAndTime(dayOfWeek, hour, numOfWeek=0, interval=1) {
// day: 0=Sunday, 1=Monday...4=Thursday...
	const helper = (result) => {
		month = 0
		if (result.getMonth() < 10) 
			month = `0${result.getMonth()+1}`
		else 
			month = `${result.getMonth()+1}`
		
		date = 0
		if (result.getDate() < 10) 
			date = `0${result.getDate()}`
		else 
			date = `${result.getDate()}`
		
		return `${result.getFullYear()}-${month}-${date}`
	}

	const helper2 = (date, interval=0) => {
		date_time = 0
		if (date.getHours() < 10) 
			date_time = `0${date.getHours() + interval}`
		else 
			date_time = `${date.getHours() + interval}`
		return `${date_time}:00:00`
	}
		
	let now = new Date()
	let start_time = new Date(
				   now.getFullYear(),
				   now.getMonth(),
				   now.getDate() + (7 + dayOfWeek - now.getDay()) % 7 + numOfWeek * 7,
				   hour,)
	
	let end_time = new Date(
					start_time.getFullYear(),
					start_time.getMonth(),
					start_time.getDate() + 1,
					hour + interval)
  
	if (start_time < now){
		start_time.setDate(start_time.getDate() + 7)
		end_time.setDate(end_time.getDate() + 7)
	}
	
	return {
		start: helper(start_time),
		end: helper(end_time),
		start_time: helper2(start_time),
		end_time:  helper2(start_time, interval),
	}
}

const DaytoNum = {
	'Mon': 1,
	'Tue': 2,
	'Wed': 3,
	'Thur': 4,
	'Fri': 5,
}


/*
~book 	14:00 			Tue&Thur 						5 								2 							1
~book {time start} {which weekday} {how many books needed=1|len(whichweekday)} {time interval(hrs)=1} {0:(L->Z) 1: reversed(Z->L)}
*/
async function reserve(message){

	const check_availability = (cur_slots, i, cur_start, cur_end) => {
		if (cur_slots[i].start == cur_start && cur_slots[i].className == undefined){
			if (time_interval > 1){
				if ( i+1 < cur_slots.length ){
					if (cur_slots[i+1].end == cur_end && cur_slots[i+1].className == undefined){
						return (cur_slots[i])
					}
				}
			} else {
				return (cur_slots[i])
			}
		}
		return undefined
	}

	output_msg = "```ml\n"

	try {
		// message = {content: '~book 14 Tue&Thur 5 2'}
		let contents = message.content.split(' ').slice(1).filter(n=>n)
		hours = parseInt(contents[0])
		days = contents[1].split('&')
		for (day in days){
			days[day] = DaytoNum[days[day]]
		}

		num_of_book = days.length

		if (num_of_book <= 0){
			output_msg += `Invalid date: ${message.content}`
			output_msg += "\n```";
			timeout_send(message, output_msg, 1000, -1)
			return
		}
		time_interval = 1
		reversed = false

		if (contents.length == 2){
			// continue
		}
		else if (contents.length == 3){
			num_of_book = parseInt(contents[2])
		}
		else if (contents.length == 4){
			num_of_book = parseInt(contents[2])
			time_interval = parseInt(contents[3])
		}
		else if (contents.length == 5){
			num_of_book = parseInt(contents[2])
			time_interval = parseInt(contents[3])
			reversed = parseInt(contents[4])
		}
		else{
			output_msg += `Invalid command: ${message.content}`
			output_msg += "\n```";
			timeout_send(message, output_msg, 1000, -1)
			return
		}
	} catch (error) {
		output_msg += `Invalid command: ${message.content}`
		output_msg += "\n```";
		timeout_send(message, output_msg, 1000, -1)
		return
	}
	
	
	let reserve_days = []
	numOfWeek = 0
	while(num_of_book > 0){
		for(day in days){
			reserve_days.push(nextDayAndTime(days[day], hours, numOfWeek, time_interval))
			--num_of_book;
			if(num_of_book <= 0) break
		}
		++numOfWeek;
	}

	try {
		for(index in reserve_days){
		
			let result_slot = undefined
	
			let cur_day = reserve_days[index]
			let cur_start = [cur_day.start,cur_day.start_time].join(' ')
			let cur_end = [cur_day.start,cur_day.end_time].join(' ')
	
			let cur_slots = await get_slots(cur_day.start, cur_day.end)
			// console.log(cur_slots)
			if (reversed){
				for(let i=cur_slots.length-(time_interval); i>=0; --i){
					result_slot = check_availability(cur_slots, i, cur_start, cur_end)
					if (result_slot) break
				}
			} else{
				for(let i=0; i<cur_slots.length-(time_interval-1); ++i){
					result_slot = check_availability(cur_slots, i, cur_start, cur_end)
					if (result_slot) break
				}
			}
			
			if (result_slot == undefined){
				console.log(`\nno available room for interval from ${cur_start} to ${cur_end}\n`)
				continue
			}
	
			// now we find the slot we want to book
			let add_result = await add_slot(
				result_slot.itemId, 
				result_slot.start, 
				result_slot.checksum, 
				cur_day.start, 
				cur_day.end
			)
			// console.log(add_result)
	
			let add_second_result = await add_second_slot(
				add_result.bookings[0].id, 
				add_result.bookings[0].optionChecksums[1], 
				add_result.bookings[0].options[1], 
				cur_day.start, 
				cur_day.end, 
				add_result.session, 
				add_result.bookings[0].eid,
				add_result.bookings[0].start,
				add_result.bookings[0].end,
				add_result.bookings[0].checksum,
			)
			// console.log(add_second_result)
	
			let book_result = await book_slots(
				'fname', 
				'lname', 
				'zc4706186250@gmail.com', 
				add_second_result.session, 
				add_second_result.bookings[0].id, 
				add_second_result.bookings[0].eid,
				add_second_result.bookings[0].start,
				add_second_result.bookings[0].end,
				add_second_result.bookings[0].checksum,
			)
			
	
			if (book_result.bookId != undefined){
				booked_room = group_study_area_code[add_second_result.bookings[0].eid]
				output_msg += `\nSuccessfully booked room '${booked_room}' from ${add_second_result.bookings[0].start} to ${add_second_result.bookings[0].end}\n`
				output_msg += `bookId: {${book_result.bookId}}, to cancel this booking visit:\nhttps://libcal.library.umass.edu/equipment/cancel?id=${book_result.bookId}\n`
				console.log(`bookId: {${book_result.bookId}}, to cancel this booking visit:\nhttps://libcal.library.umass.edu/equipment/cancel?id=${book_result.bookId}\n`)
			}
			else{
				console.log(book_result)
				console.log(`\nno available room for interval from ${cur_start} to ${cur_end}\n`)
				output_msg += `\nno available room for interval from ${cur_start} to ${cur_end}\n`
				output_msg += `Detail: ${book_result.error}\n`
			}
			
			await delay(5000)
		}
		output_msg += "\n```";
	
		timeout_send(message, output_msg, 1000, -1)
	} catch (error) {
		console.log(error.data)
	}

	// console.log(result_slot)
	// console.log(reserve_days)
}


exports.reserve = reserve;