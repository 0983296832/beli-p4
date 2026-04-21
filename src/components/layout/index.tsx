import React, { useCallback, useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import {
  LOGO,
  BARS,
  NOTEBOOK,
  USER_GROUP,
  NOTIFICATION,
  USER,
  HOME,
  EDIT_USER_02_BLACK,
  SETTING_01,
  SCHOOL,
  USER_ADMIN,
  USER_SQUARE,
  USER_ID_VERIFICATION,
  BOOK_SHELF_03,
  DATA_ICON,
  FILE_LINE,
  CHEVRON_LEFT_ICON,
  SIGNOUT_BLUE,
  VN_FLAG,
  ENG_FLAG,
  HOME_ICON,
  NOTE_ICON,
  SCHOOL_ICON,
  USER_SHIELD_ICON,
  BOOK_ICON,
  USER_SQUARE_ICON,
  USER_VERIFICATION_ICON,
  USER_GROUP_ICON,
  DATA_ICON_01,
  BOOKSHELF_ICON,
  USER_EDIT_ICON,
  SETTING_ICON
} from '@lib/ImageHelper';
import { useT } from '@hooks/useT';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { uniqueId } from 'lodash';
import { useRootStore } from '@store/index';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import i18n from '@i18n/index';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { USER_ROLE } from '@constants/index';
import Notification from '@pages/Notification';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  RiBookOpenLine,
  RiCalendarCheckLine,
  RiFileTextLine,
  RiGroupLine,
  RiHome5Line,
  RiMapPinLine,
  RiSchoolLine,
  RiSettings3Line,
  RiUser3Line,
  RiUserLine,
  RiUserStarLine
} from '@remixicon/react';

interface Props {
  children: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  const uniqId = uniqueId();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { t } = useT();
  const { currentUser, onLogout, permissions, notificationCount } = useRootStore();
  const [showMenuUser, setShowMenuUser] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('language') || 'vi');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState(2);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [submenuPosition, setSubmenuPosition] = React.useState({ top: 0, left: 0 });
  const [hoveredItemCollapse, setHoveredItemCollapse] = useState<number | null>(null);
  const [submenuPositionCollapse, setSubmenuPositionCollapse] = React.useState({ top: 0, left: 0 });
  const isPracticeScreen =
    location.pathname.includes('/practice/exam') ||
    location.pathname.includes('/practice/training') ||
    location.pathname.includes('/practice/') ||
    location.pathname.includes('/try-assignment/');

  const menu = [
    {
      key: 1,
      name: t('home'),
      icon: <RiHome5Line className='icon-menu size-[18px]' />,

      permissions: true,
      href: '/',
      is_sub: false
    },
    {
      key: 2,
      name: t('attendance'),
      icon: <RiCalendarCheckLine className='icon-menu size-[18px]' />,
      permissions:
        !!permissions.ACCESS_STUDENT_ATTENDANCE ||
        !!permissions.ACCESS_TEACHER_ATTENDANCE ||
        !!permissions.ACCESS_TA_ATTENDANCE,
      href:
        currentUser?.user_job_title == USER_ROLE?.ADMIN || currentUser?.user_job_title == USER_ROLE?.OWNER
          ? '/attendance/summary/list'
          : !!permissions.ACCESS_STUDENT_ATTENDANCE
            ? '/attendance/students/list'
            : !!permissions.ACCESS_TEACHER_ATTENDANCE
              ? '/attendance/teachers/list'
              : '/attendance/teachers_assistant/list',
      is_sub: true,
      subs: [
        {
          name: t('students'),
          href: '/attendance/students/list',
          permissions: !!permissions.ACCESS_STUDENT_ATTENDANCE
        },
        {
          name: t('teachers'),
          href: '/attendance/teachers/list',
          permissions: !!permissions.ACCESS_TEACHER_ATTENDANCE
        },
        {
          name: t('teaching_assistant'),
          href: '/attendance/teachers_assistant/list',
          permissions: !!permissions.ACCESS_TA_ATTENDANCE
        },
        {
          name: t('attendance_summary'),
          href: '/attendance/summary/list',
          permissions:
            currentUser?.user_job_title == USER_ROLE?.ADMIN || currentUser?.user_job_title == USER_ROLE?.OWNER
        }
      ],
      extra_route: [
        '/attendance/students/detail/',
        '/attendance/students/edit/',
        '/attendance/students/detail-compare/',
        '/attendance/teachers/detail/',
        '/attendance/teachers/edit/',
        '/attendance/teachers/detail-compare/',
        '/attendance/teachers_assistant/detail/',
        '/attendance/teachers_assistant/edit/',
        '/attendance/teachers_assistant/detail-compare/',
        '/attendance/summary/detail/'
      ]
    },
    {
      key: 3,
      name: t('classroom'),
      icon: <RiSchoolLine className='icon-menu size-[18px]' />,
      href: '/classroom/list',
      permissions: !!permissions.ACCESS_CLASSROOM,
      is_sub: true,
      subs: [
        { name: t('classroom'), href: 'classroom/list', permissions: true },
        { name: t('study_schedule'), href: 'study-schedule', permissions: true }
      ],
      extra_route: [
        '/classroom/detail/',
        '/classroom/edit/',
        '/classroom/setting/',
        '/classroom/add_bulk',
        '/classroom/add'
      ]
    },
    {
      key: 4,
      name: t(currentUser?.user_job_title == USER_ROLE.STUDENT ? '_lesson_content' : 'teaching_program'),
      icon: <RiFileTextLine className='icon-menu size-[18px]' />,
      permissions: !!permissions.ACCESS_TEACHING_PROGRAM,
      href: '/teaching-program/list',
      is_sub: false,
      // subs: [
      //   { name: t('teaching_program'), href: '/teaching-program/list', permissions: true },
      //   { name: t('content'), href: '', permissions: true }
      // ]
      extra_route: ['/teaching-program/detail/', '/teaching-program/edit/']
    },
    {
      key: 5,
      name: t(currentUser?.user_job_title == USER_ROLE.STUDENT ? 'exercise' : 'curriculum'),
      icon: <RiBookOpenLine className='icon-menu size-[18px]' />,
      href: '/curriculum/list',
      permissions: !!permissions.ACCESS_STUDY_PROGRAM,
      is_sub: true,
      subs: [
        { name: t('curriculum'), href: '/curriculum/list', permissions: true },
        { name: t('homework'), href: '/exercise/list', permissions: true },
        {
          name: t(currentUser?.user_job_title == USER_ROLE.STUDENT ? 'academic_result' : 'report'),
          href:
            currentUser?.user_job_title === USER_ROLE?.STUDENT ? '/curriculum/report-session' : '/curriculum/report',
          permissions: true
        }
      ],
      extra_route: ['/curriculum/detail/', '/curriculum/edit/', '/exercise/detail/', '/exercise/edit/']
    },
    {
      key: 6,
      name: t('students'),
      icon: <RiGroupLine className='icon-menu size-[18px]' />,
      href: '/user/student/list',
      is_sub: false,
      permissions: !!permissions.ACCESS_STUDENT,
      extra_route: ['/user/student/detail/', '/user/student/edit/', '/user/student/add']
    },
    {
      key: 7,
      name: t('teachers'),
      icon: <RiUserStarLine className='icon-menu size-[18px]' />,
      href: '/user/teacher/list',
      is_sub: false,
      permissions: !!permissions.ACCESS_TEACHER,
      extra_route: ['/user/teacher/detail/', '/user/teacher/edit/', '/user/teacher/add']
    },
    {
      key: 8,
      name: t('teaching_assistant'),
      icon: <RiUser3Line className='icon-menu size-[18px]' />,
      href: '/user/teacher_assistant/list',
      is_sub: false,
      permissions: !!permissions.ACCESS_TA,
      extra_route: ['/user/teacher_assistant/detail/', '/user/teacher_assistant/edit/', '/user/teacher_assistant/add']
    },
    {
      key: 9,
      name: t('administrator'),
      icon: <RiUserLine className='icon-menu size-[18px]' />,
      href: '/user/administrator/list',
      is_sub: false,
      permissions: !!permissions.ACCESS_ADMIN,
      extra_route: ['/user/administrator/detail/', '/user/administrator/edit/', '/user/administrator/add']
    },
    {
      key: 10,
      name: t('teaching_location'),
      icon: <RiMapPinLine className='icon-menu size-[18px]' />,
      href: '/locations/list',
      is_sub: false,
      permissions: !!permissions.ACCESS_LOCATION,
      extra_route: ['/locations/detail/', '/locations/edit/', '/locations/add']
    },
    {
      key: 11,
      name: t('subject'),
      icon: <RiBookOpenLine className='icon-menu size-[18px]' />,
      href: '/subjects/list',
      is_sub: false,
      permissions: !!permissions.ACCESS_SUBJECT,
      extra_route: ['/subjects/detail/', '/subjects/edit/', '/subjects/add']
    },
    {
      key: 12,
      name: t('permission'),
      icon: <RiSettings3Line className='icon-menu size-[18px]' />,
      href: '/permission',
      is_sub: false,
      permissions: permissions.ACCESS_OWNER || permissions?.ACCESS_ADMIN
    }
  ];

  const langOptions = [
    {
      value: 'vi',
      image: VN_FLAG,
      label: 'Tiếng Việt'
    },
    {
      value: 'en',
      image: ENG_FLAG,
      label: 'English'
    }
  ];

  const LogoNavigate = () => {
    if (currentUser?.user_job_title === USER_ROLE.STUDENT) {
      return '#/study-schedule';
    } else if (currentUser?.user_job_title === USER_ROLE.TEACHER || currentUser?.user_job_title === USER_ROLE.TA) {
      return '#/teaching-program/list';
    } else {
      return '#/';
    }
  };

  const handleMouseEnter = (key: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSubmenuPosition({
      top: rect.top,
      left: rect.right + 4 // 8px spacing from sidebar
    });
    setHoveredItem(key);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleMouseEnterCollapse = useCallback(
    (key: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setSubmenuPositionCollapse({
        top: rect?.top - 20,
        left: 260 // 8px spacing from sidebar
      });
      setHoveredItemCollapse(key);
    },
    [hoveredItemCollapse]
  );

  const handleMouseLeaveCollapse = useCallback(() => {
    setHoveredItemCollapse(null);
  }, [hoveredItemCollapse]);

  useEffect(() => {
    // Kiểm tra URL hiện tại và thiết lập activeKey dựa trên href khớp
    if (location.pathname == '/') {
      setActiveKey(1);
    } else {
      const matchedMenuItem = menu.find((item) => {
        if (item.key != 1)
          return (
            location.pathname.includes(item.href) ||
            (item.subs && item.subs.some((sub) => location.pathname.includes(sub.href))) ||
            (item?.extra_route && item?.extra_route.some((route) => location.pathname.includes(route)))
          );
      });
      // Nếu tìm thấy item phù hợp, set activeKey, nếu không sẽ mặc định là 2
      if (matchedMenuItem) {
        setActiveKey(matchedMenuItem.key);
      } else {
        setActiveKey(2); // Key mặc định nếu không tìm thấy item
      }
    }
  }, [location.pathname]);

  return (
    <div className='h-screen'>
      {/* Header */}
      {location.pathname !== '/verify-account' && !isPracticeScreen && (
        <div className='fixed top-0 left-0 right-0 z-[49] border-b border-primary-neutral-200 bg-primary-neutral-50/95 backdrop-blur-sm h-[62px] flex items-center justify-between p-3 sm:pr-8 sm:pl-3 sm:space-x-6 space-x-3 shadow-sm'>
          <div className='flex items-center '>
            {/* <div className='flex items-center gap-[18px]'> */}
            {/* Mobile Menu (Sheet) */}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger onClick={() => setIsSheetOpen(true)}>
                <img src={BARS} alt='menu' className='sm:hidden block' />
              </SheetTrigger>

              <SheetContent
                side='left'
                className='w-[280px] py-3 px-0 space-y-6 border-r border-primary-neutral-200 bg-primary-neutral-50'
              >
                <SheetHeader>
                  <SheetTitle className='flex items-center gap-3 px-4'>
                    <img className='size-40 rounded-xl' src={LOGO} alt='' />
                    <div className='text-[10px] font-bold text-primary-blue-600'>BeliTeachers</div>
                  </SheetTitle>
                </SheetHeader>

                <div className='flex items-center gap-3 px-4 text-primary-blue-600'>
                  <img src={BARS} alt='bars' />
                  <div className='text-lg font-medium'>{t('category')}</div>
                </div>

                <Accordion
                  type='single'
                  collapsible
                  className='flex flex-col overflow-y-auto h-[calc(100vh-135px)] space-y-1 hide-scrollbar'
                >
                  {menu.map((m, mIdx) =>
                    m.permissions ? (
                      <AccordionItem
                        key={`menu-${uniqId}-${mIdx}`}
                        value={String(m.key)}
                        className='border-b border-dashed border-primary-neutral-200'
                      >
                        {m.is_sub ? (
                          <>
                            <AccordionTrigger className='px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-primary-blue-100 transition-colors'>
                              <div className='flex items-center gap-3'>
                                {m.icon}
                                <span className='font-medium text-sm text-menu'>{m.name}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className='pl-10 space-y-1 pr-2'>
                              {m.subs?.map(
                                (sub, sIdx) =>
                                  sub.permissions && (
                                    <Link
                                      key={`submenu-${sIdx}`}
                                      to={sub.href}
                                      onClick={() => setIsSheetOpen(false)}
                                      className='block p-2 text-sm rounded-md text-primary-neutral-700 hover:bg-primary-blue-600 hover:text-white transition-colors'
                                    >
                                      {sub.name}
                                    </Link>
                                  )
                              )}
                            </AccordionContent>
                          </>
                        ) : (
                          <Link
                            to={m.href}
                            onClick={() => setIsSheetOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                              activeKey === m.key
                                ? 'bg-primary-blue-600 text-white rounded-md mx-2'
                                : 'mx-2 rounded-md hover:bg-primary-blue-100 transition-colors'
                            }`}
                          >
                            {m.icon}
                            <span className='font-medium text-sm text-menu'>{m.name}</span>
                          </Link>
                        )}
                      </AccordionItem>
                    ) : null
                  )}
                </Accordion>
              </SheetContent>
            </Sheet>
            <div className='flex items-center gap-3'>
              <a href={LogoNavigate()}>
                <img src={LOGO} alt='Logo' className='size-12 sm:block hidden rounded-md' />
              </a>
              <p className='text-base font-bold text-primary-blue-600 sm:block hidden'>BeliTeachers </p>
            </div>
          </div>
          <div className='flex items-center justify-end sm:gap-6 gap-2'>
            <Popover>
              <PopoverTrigger>
                <div className='flex items-center justify-center w-10 h-10 rounded-full border border-primary-neutral-200 bg-white relative shadow-sm'>
                  <img className='w-5 h-5' src={NOTIFICATION} alt='notification' />
                  {notificationCount > 0 && (
                    <div className='h-5 min-w-5 rounded-full px-1 text-xs absolute -top-2 -right-2 text-white bg-primary-blue-600 flex items-center justify-center'>
                      {notificationCount > 99 ? `99+` : notificationCount}
                    </div>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className='w-[calc(100vw-40px)] sm:w-[450px] p-0 rounded-[10px] mr-1 ml-6 sm:ml-0'>
                <Notification />
              </PopoverContent>
            </Popover>

            <Popover open={showMenuUser} onOpenChange={() => setShowMenuUser(!showMenuUser)}>
              <PopoverTrigger>
                <div className='flex items-center justify-center h-10 w-max rounded-full border border-primary-neutral-200 bg-white px-2 gap-2 shadow-sm'>
                  <img src={currentUser?.avatar} className='w-7 h-7 min-w-7 min-h-7 rounded-full object-cover' />
                  <p className='w-[120px] sm:w-full text-xs sm:text-sm'>{currentUser?.display_name}</p>
                  <ChevronDown className='size-5 mt-1' />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className='w-[calc(100vw-40px)] sm:w-[320px] p-0 rounded-xl mr-1 border border-primary-neutral-200'
                align='center'
              >
                <div
                  className='p-3 rounded-t-xl hover:bg-primary-blue-50 cursor-pointer flex items-center justify-between'
                  onClick={() => {
                    navigate('/profile');
                  }}
                >
                  <div className='flex items-center gap-3'>
                    <img className='w-5 h-5' src={USER} alt='user' />
                    <p className='text-primary-neutral-900 text-base'>
                      {currentUser?.display_name} - {currentUser?.username}
                    </p>
                  </div>
                </div>
                {/* <div
                  className='p-3 hover:bg-primary-neutral-200 cursor-pointer flex items-center justify-between'
                  onClick={() => {}}
                >
                  <div className='flex items-center gap-3'>
                    <img className='w-6 h-6' src={SETTING_01} alt='user' />
                    <p className='text-primary-neutral-900 text-base'>{t('setting')}</p>
                  </div>
                </div> */}

                <div className='hover:bg-primary-blue-50 cursor-pointer py-1.5'>
                  <Select
                    value={lang}
                    onValueChange={(value) => {
                      setLang(value);
                      i18n.changeLanguage(value);
                      localStorage.setItem('language', value);
                    }}
                  >
                    <SelectTrigger className='w-full outline-none text-primary-orange ring-0 border-0 shadow-none focus-visible:ring-0 focus:ring-0 py-0'>
                      <SelectValue /* placeholder={t('please_choose')} */ className='text-primary-orange' />
                    </SelectTrigger>
                    <SelectContent side='bottom' className='ml-4'>
                      <SelectGroup>
                        {langOptions?.map((option) => {
                          return (
                            <SelectItem value={option.value} key={option.value} className='cursor-pointer'>
                              <div className='flex items-center gap-3'>
                                <img className='w-6 h-6' src={option.image} alt='user' />
                                <p className='text-primary-neutral-900 text-base'>{option.label}</p>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {/* <div className='flex items-center justify-between w-full'>
                  
                  <div className='flex items-center gap-3'>
                    <img className='w-6 h-6' src={VN_FLAG} alt='user' />
                    <p className='text-primary-neutral-900 text-base'>Tiếng Việt</p>
                  </div>
                  <img className='w-6 h-6' src={CHEVRON_LEFT_ICON} alt='user' />
                </div> */}
                </div>
                <div
                  className='p-3 rounded-b-xl hover:bg-primary-blue-50 cursor-pointer flex items-center justify-between border-t border-primary-neutral-200'
                  onClick={() => {
                    setShowMenuUser(false);
                    onLogout?.(true);
                  }}
                >
                  <div className='flex items-center gap-3'>
                    <img className='w-5 h-5' src={SIGNOUT_BLUE} alt='signout' />
                    <p className='text-base text-primary-blue-600'>{t('sign_out')}</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      <div className='flex '>
        {' '}
        {/* Sidebar */}
        {location.pathname !== '/verify-account' && !isPracticeScreen && (
          <>
            <aside className='fixed hidden sm:flex top-[62px] left-0 z-40 w-[70px] bg-primary-neutral-50/95 backdrop-blur-sm border-r border-primary-neutral-200 flex-col items-center divide-y divide-primary-neutral-200 shadow-md h-[calc(100vh-62px)] overflow-y-auto hide-scrollbar'>
              {menu?.map((m, index) => {
                if (m.permissions) {
                  return (
                    <div className='p-1 relative wrapper-menu' key={index}>
                      <div
                        className={`group relative rounded-xl parent-menu w-[62px] h-[63px] flex items-center justify-center transition-all ${
                          activeKey == m.key
                            ? 'active-menu bg-primary-blue-600 shadow-md shadow-primary-blue-200 [&_.icon-menu]:text-white'
                            : 'hover:bg-primary-blue-600 hover:shadow-md hover:shadow-primary-blue-200  [&_.icon-menu]:text-primary-neutral-700 hover:[&_.icon-menu]:text-white'
                        }`}
                        onClick={() => {
                          setIsSheetOpen(false);
                          setActiveKey(m.key);
                        }}
                        onMouseEnter={(e) => handleMouseEnter(m?.key, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          to={m.href}
                          className='cursor-pointer hover:rounded-xl w-full h-full flex items-center justify-center'
                        >
                          <div className='flex items-center justify-center flex-col gap-1.5 max-w-[56px]'>
                            {m.icon}
                            <span
                              className={`menu-label font-semibold text-[10px] text-center leading-tight ${
                                activeKey == m.key
                                  ? 'text-primary-neutral-50'
                                  : 'text-primary-neutral-700 group-hover:text-primary-neutral-50'
                              }`}
                            >
                              {m.name}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                }
              })}
            </aside>
            {hoveredItem && (
              <div
                className={`fixed z-50 min-w-[220px] transition-all rounded-xl divide-y divide-dashed divide-primary-neutral-200 bg-white border border-primary-neutral-200 shadow-lg ${
                  !menu.find((item) => item.key === hoveredItem)?.subs && 'hidden'
                } before:content-[''] before:absolute before:top-0 before:-left-2 before:h-full before:w-3 bg-transparent`}
                style={{
                  top: submenuPosition.top,
                  left: submenuPosition.left
                }}
                onMouseEnter={() => setHoveredItem(hoveredItem)}
                onMouseLeave={handleMouseLeave}
              >
                {menu
                  .find((item) => item.key === hoveredItem)
                  ?.subs?.map((sub, sIdx) => {
                    if (sub.permissions)
                      return (
                        <div key={`submenu-${sIdx}`} className='py-1 '>
                          <Link
                            to={sub.href}
                            className='block p-2 text-sm hover:rounded-lg hover:bg-primary-blue-600 hover:text-primary-neutral-50 text-primary-neutral-900'
                          >
                            {sub.name}
                          </Link>
                        </div>
                      );
                  })}
              </div>
            )}
          </>
        )}
        {/* Main content wrapper */}
        <div
          className={`flex-1 flex flex-col ${location.pathname !== '/verify-account' && !isPracticeScreen && 'ml:0 sm:ml-[70px]'}`}
        >
          {/* Content */}
          <main
            className={`flex-1 overflow-y-auto  ${location.pathname !== '/verify-account' && !isPracticeScreen && 'pt-[62px]'}`}
          >
            <div
              className={`flex flex-col ${location.pathname !== '/verify-account' && !isPracticeScreen && 'p-6 bg-center min-h-[calc(100vh-62px)] bg-primary-neutral-100'} `}
            >
              {children}
            </div>
          </main>
          {/* <main className='flex-1 overflow-y-auto mt-[62px] px-10 pb-6 bg-image-home bg-cover bg-center'>{children}</main> */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
