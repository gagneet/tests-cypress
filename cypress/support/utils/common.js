import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const today = dayjs().format('DD-MM-YYYY HH:mm:ss');
export const endDate = dayjs().add(1, 'month').format('DD-MM-YYYY HH:mm:ss');
export const todayUTC = dayjs().utc().format(); // convert local time to UTC time
export const endDateUTC = dayjs().add(1, 'month').utc().format();