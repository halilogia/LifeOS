import exam2021 from "./exam2021.json";
import exam2020 from "./exam2020.json";
import exam2019 from "./exam2019.json";
import exam2018 from "./exam2018.json";
import exam2017 from "./exam2017.json";
import exam2015 from "./exam2015.json";
import exam2014 from "./exam2014.json";
import exam2013 from "./exam2013.json";
import exam2012 from "./exam2012.json";
import exam2011 from "./exam2011.json";
import exam2010 from "./exam2010.json";
import exam2009 from "./exam2009.json";
import examTarihArsivi from "./exam_tarih_arsivi.json";

export const KPSS_YEARLY_DATA: Record<string, any> = {
  "2021": exam2021,
  "2020": exam2020,
  "2019": exam2019,
  "2018": exam2018,
  "2017": exam2017,
  "2015": exam2015,
  "2014": exam2014,
  "2013": exam2013,
  "2012": exam2012,
  "2011": exam2011,
  "2010": exam2010,
  "2009": exam2009,
  tarih_arsivi: examTarihArsivi,
};
