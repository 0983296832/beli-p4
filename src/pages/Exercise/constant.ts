import { generateSimpleId } from '@lib/JsHelper';
import { cloneDeep } from 'lodash';

export const MULTIPLE_CHOICE = 1;
export const FILL_IN_THE_BLANK = 2;
export const MATCHING = 3;
export const ORDERING = 4;
export const REVERSE_WORD = 5;
export const INIT_FORM_DATA = {
  question_type: 1,
  question_title: '',
  question_file: {
    url: '',
    type: null
  },
  score: 1,
  multiple_choice_answers: {
    is_multiple_choice: 0,
    options: [
      {
        id: generateSimpleId('answer_1'),
        is_correct_answer: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      },
      {
        id: generateSimpleId('answer_2'),
        is_correct_answer: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      },
      {
        id: generateSimpleId('answer_3'),
        is_correct_answer: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      },
      {
        id: generateSimpleId('answer_4'),
        is_correct_answer: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      }
      // {
      //   id: generateSimpleId('answer_5'),
      //   is_correct_answer: 0,
      //   answer_title: '',
      //   file: {
      //     url: '',
      //     type: null
      //   }
      // }
    ]
  },
  fill_in_the_blank: {
    id: 0,
    answer_title: '',
    input_type: 0,
    other_correct_answer: [],
    ignore_case: 0
  },
  matching: {
    options: [
      {
        id: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      },
      {
        id: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      },
      {
        id: 0,
        answer_title: '',

        file: {
          url: '',
          type: null
        }
      },
      {
        id: 0,
        answer_title: '',

        file: {
          url: '',
          type: null
        }
      }
      // {
      //   id: 0,
      //   answer_title: '',

      //   file: {
      //     url: '',
      //     type: null
      //   }
      // }
    ],
    descriptions: [
      { answer_id: 0, answer_description: '', id: 1 },
      { answer_id: 0, answer_description: '', id: 1 },
      { answer_id: 0, answer_description: '', id: 1 },
      { answer_id: 0, answer_description: '', id: 1 }
      // { answer_id: 0, answer_description: '', id: 1 }
    ]
  },
  sort: {
    options: [
      {
        id: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      },
      {
        id: 0,
        answer_title: '',
        file: {
          url: '',
          type: null
        }
      },
      {
        id: 0,
        answer_title: '',

        file: {
          url: '',
          type: null
        }
      },
      {
        id: 0,
        answer_title: '',

        file: {
          url: '',
          type: null
        }
      }
      // {
      //   id: 0,
      //   answer_title: '',

      //   file: {
      //     url: '',
      //     type: null
      //   }
      // }
    ],
    descriptions: [
      { answer_id: 0, answer_description: '', id: 1 },
      { answer_id: 0, answer_description: '', id: 1 },
      { answer_id: 0, answer_description: '', id: 1 },
      { answer_id: 0, answer_description: '', id: 1 }
      // { answer_id: 0, answer_description: '', id: 1 }
    ]
  },
  reverse_word: {
    options: [
      // {
      //   id: 0,
      //   answer_title: '',
      //   position: 1
      // }
      // {
      //   id: 0,
      //   answer_title: '',
      //   position: 2
      // },
      // {
      //   id: 0,
      //   answer_title: '',
      //   position: 3
      // },
      // {
      //   id: 0,
      //   answer_title: '',
      //   position: 4
      // }
      // {
      //   id: 0,
      //   answer_title: '',
      //   position: 5
      // }
    ]
  },
  answer_explanation: {
    explain_description: '',
    explain_file: {
      url: '',
      type: null
    }
  }
};

export const MOCK_DATA = {
  exercise_name: '',
  exercise_code: '',
  id: 0,
  locations: [],
  questions: [
    {
      id: 0,
      question_type: 1,
      question_title: '<p style="color: #FFFFFF"> Con chó trong tiếng anh là gì?</p> ',
      question_file: {
        url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        type: 'audio'
      },
      score: 1,
      multiple_choice_answers: {
        is_multiple_choice: 1,
        options: [
          {
            id: 1,
            is_correct_answer: 1,
            answer_title: '<p style="color: #FFFFFF">dog</p> ',
            file: {
              url: 'https://quangcaongoaitroi.com/wp-content/uploads/2019/12/du-an-sinh-nhat-JungKook-BTS-1.jpg',
              type: 'image'
            }
          },
          {
            id: 2,
            is_correct_answer: 0,
            answer_title: '<p style="color: #FFFFFF">cat</p> ',
            file: {
              url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
              type: 'audio'
            }
          },
          {
            id: 3,
            is_correct_answer: 0,
            answer_title: '<p style="color: #FFFFFF">fish</p> ',
            file: {
              url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              type: 'video'
            }
          },
          {
            id: 4,
            is_correct_answer: 0,
            answer_title: ' <p style="color: #FFFFFF">bird</p>',
            file: {
              url: '',
              type: null
            }
          },
          {
            id: 5,
            is_correct_answer: 0,
            answer_title: '<p style="color: #FFFFFF">chicken</p>',
            file: {
              url: '',
              type: null
            }
          }
        ]
      },
      answer_explanation: {
        explain_description: '<p style="color: #FFFFFF">Đơn giản v cũng hỏi??????</p>',
        explain_file: {
          url: '',
          type: null
        }
      }
    },
    {
      id: 0,
      question_type: 2,
      question_title: '<p style="color: #FFFFFF"> Con chó trong tiếng anh là gì?</p> ',
      question_file: {
        url: 'https://quangcaongoaitroi.com/wp-content/uploads/2019/12/du-an-sinh-nhat-JungKook-BTS-1.jpg',
        type: 'image'
      },
      score: 1,
      fill_in_the_blank: {
        answer_title: 'Con Dog Cai Bang',
        input_type: 0
      },

      answer_explanation: {
        explain_description: '<p style="color: #FFFFFF">Đơn giản v cũng hỏi??????</p>',
        explain_file: {
          url: '',
          type: null
        }
      }
    },
    {
      id: 0,
      question_type: 3,
      question_title: '<p style="color: #FFFFFF">Chọn các đáp án tương ứng?</p> ',
      question_file: {
        url: 'https://quangcaongoaitroi.com/wp-content/uploads/2019/12/du-an-sinh-nhat-JungKook-BTS-1.jpg',
        type: 'image'
      },
      score: 1,
      matching: {
        options: [
          {
            id: 1,
            answer_title: '<p style="color: #FFFFFF">Dog</p>',
            file: {
              url: 'https://quangcaongoaitroi.com/wp-content/uploads/2019/12/du-an-sinh-nhat-JungKook-BTS-1.jpg',
              type: 'image'
            }
          },
          {
            id: 2,
            answer_title: '<p style="color: #FFFFFF">Cat</p>',
            file: {
              url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
              type: 'audio'
            }
          },
          {
            id: 3,
            answer_title: '<p style="color: #FFFFFF">Fish</p>',

            file: {
              url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              type: 'video'
            }
          },
          {
            id: 4,
            answer_title: '<p style="color: #FFFFFF">Bird</p>',

            file: {
              url: '',
              type: null
            }
          },
          {
            id: 5,
            answer_title: '<p style="color: #FFFFFF">Chicken</p>',
            answer_description: '<p style="color: #FFFFFF">Gà</p>',
            answer_description_id: 5,
            file: {
              url: '',
              type: null
            }
          }
        ],
        descriptions: [
          { answer_id: 2, answer_description: '<p style="color: #FFFFFF">Con Chó</p>', id: 1 },
          {
            answer_id: 1,
            answer_description: '<p style="color: #FFFFFF">Mèo</p>',
            id: 2
          },
          {
            answer_id: 3,
            answer_description: '<p style="color: #FFFFFF">Cá</p>',
            id: 3
          },
          {
            answer_id: 4,
            answer_description: '<p style="color: #FFFFFF">Chim</p>',
            id: 4
          },
          {
            answer_id: 5,
            answer_description: '<p style="color: #FFFFFF">Chim</p>',
            id: 5
          }
        ]
      },
      answer_explanation: {
        explain_description: '<p style="color: #FFFFFF">Đơn giản v cũng hỏi??????</p>',
        explain_file: {
          url: '',
          type: null
        }
      }
    },
    {
      id: 0,
      question_type: 4,
      question_title: '<p style="color: #FFFFFF">Kéo đáp án vào vị trí tương ứng?</p> ',
      question_file: {
        url: 'https://quangcaongoaitroi.com/wp-content/uploads/2019/12/du-an-sinh-nhat-JungKook-BTS-1.jpg',
        type: 'image'
      },
      score: 1,
      sort: {
        options: [
          {
            id: 1,
            answer_title: '<p style="color: #FFFFFF">Dog</p>',
            file: {
              url: 'https://quangcaongoaitroi.com/wp-content/uploads/2019/12/du-an-sinh-nhat-JungKook-BTS-1.jpg',
              type: 'image'
            }
          },
          {
            id: 2,
            answer_title: '<p style="color: #FFFFFF">Cat</p>',
            file: {
              url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
              type: 'audio'
            }
          },
          {
            id: 3,
            answer_title: '<p style="color: #FFFFFF">Fish</p>',

            file: {
              url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              type: 'video'
            }
          },
          {
            id: 4,
            answer_title: '<p style="color: #FFFFFF">Bird</p>',

            file: {
              url: '',
              type: null
            }
          },
          {
            id: 5,
            answer_title: '<p style="color: #FFFFFF">Chicken</p>',
            file: {
              url: '',
              type: null
            }
          }
        ],
        descriptions: [
          { answer_id: 2, answer_description: '<p style="color: #FFFFFF">Con Chó</p>', id: 1 },
          {
            answer_id: 1,
            answer_description: '<p style="color: #FFFFFF">Mèo</p>',
            id: 2
          },
          {
            answer_id: 3,
            answer_description: '<p style="color: #FFFFFF">Cá</p>',
            id: 3
          },
          {
            answer_id: 4,
            answer_description: '<p style="color: #FFFFFF">Chim</p>',
            id: 4
          },
          {
            answer_id: 5,
            answer_description: '<p style="color: #FFFFFF">Chim</p>',
            id: 5
          }
        ]
      },
      answer_explanation: {
        explain_description: '<p style="color: #FFFFFF">Đơn giản v cũng hỏi??????</p>',
        explain_file: {
          url: '',
          type: null
        }
      }
    },
    {
      id: 0,
      question_type: 1,
      question_title: '<p style="color: #FFFFFF"> Con chó trong tiếng anh là gì?</p> ',
      question_file: {
        url: 'http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        type: 'audio'
      },
      score: 1,
      reverse_word: {
        options: [
          {
            id: 1,
            answer_title: 'dog',
            position: 1
          },
          {
            id: 2,
            answer_title: 'cat',
            position: 2
          },
          {
            id: 3,
            answer_title: 'fish',
            position: 3
          },
          {
            id: 4,
            answer_title: 'bird',
            position: 4
          },
          {
            id: 5,
            answer_title: 'chicken',
            position: 5
          }
        ]
      },
      answer_explanation: {
        explain_description: '<p style="color: #FFFFFF">Đơn giản v cũng hỏi??????</p>',
        explain_file: {
          url: '',
          type: null
        }
      }
    }
  ]
};

export const CREATE_EX_DATA = (type: number) => {
  switch (type) {
    case 1: {
      const cloneData = cloneDeep(INIT_FORM_DATA.multiple_choice_answers);
      return {
        ...cloneData,
        options: cloneData.options?.map((opt) => ({ ...opt, id: generateSimpleId('answer') }))
      };
    }

    case 2: {
      const cloneData = cloneDeep(INIT_FORM_DATA.fill_in_the_blank);
      return {
        ...cloneData
        // id: generateSimpleId('answer')
      };
    }

    case 3: {
      const cloneData = cloneDeep(INIT_FORM_DATA.matching);
      const arrRandomId = [
        generateSimpleId('answer_1'),
        generateSimpleId('answer_2'),
        generateSimpleId('answer_3'),
        generateSimpleId('answer_4'),
        generateSimpleId('answer_5')
      ];

      return {
        ...cloneData,
        options: cloneData.options.map((opt, idx) => ({ ...opt, id: arrRandomId[idx] })),
        descriptions: cloneData.descriptions.map((opt, idx) => ({
          ...opt,
          id: generateSimpleId(`desc_${idx}`),
          answer_id: arrRandomId[idx]
        }))
      };
    }

    case 4: {
      const cloneData = cloneDeep(INIT_FORM_DATA.sort);
      const arrRandomId = [
        generateSimpleId('answer_1'),
        generateSimpleId('answer_2'),
        generateSimpleId('answer_3'),
        generateSimpleId('answer_4'),
        generateSimpleId('answer_5')
      ];

      return {
        ...cloneData,
        options: cloneData.options.map((opt, idx) => ({ ...opt, id: arrRandomId[idx] })),
        descriptions: cloneData.descriptions.map((opt, idx) => ({
          ...opt,
          id: generateSimpleId(`desc_${idx}`),
          answer_id: arrRandomId[idx]
        }))
      };
    }
    case 5: {
      const cloneData = cloneDeep(INIT_FORM_DATA.reverse_word);
      // const arrRandomId = [
      //   generateSimpleId('answer_1'),
      //   generateSimpleId('answer_2'),
      //   generateSimpleId('answer_3'),
      //   generateSimpleId('answer_4'),
      //   generateSimpleId('answer_5')
      // ];

      return {
        ...cloneData,
        options: []
        // options: cloneData.options.map((opt, idx) => ({ ...opt, id: arrRandomId[idx] }))
      };
    }
  }
};

export const FORMAT_ANSWER_ID = (type: number, data: any) => {
  switch (type) {
    case 1: {
      const cloneData: any = cloneDeep(data);
      const arrRandomId = [
        generateSimpleId('answer_1'),
        generateSimpleId('answer_2'),
        generateSimpleId('answer_3'),
        generateSimpleId('answer_4'),
        generateSimpleId('answer_5')
      ];

      return {
        ...cloneData,
        options: cloneData.options.map((opt: any, idx: number) => ({ ...opt, id: arrRandomId[idx] })),
        descriptions: cloneData.descriptions.map((opt: any, idx: number) => ({
          ...opt,
          id: generateSimpleId(`desc_${idx}`),
          answer_id: arrRandomId[idx]
        }))
      };
    }

    case 2: {
      const cloneData: any = cloneDeep(data);
      const arrRandomId = [
        generateSimpleId('answer_1'),
        generateSimpleId('answer_2'),
        generateSimpleId('answer_3'),
        generateSimpleId('answer_4'),
        generateSimpleId('answer_5')
      ];

      return {
        ...cloneData,
        options: cloneData.options.map((opt: any, idx: number) => ({ ...opt, id: arrRandomId[idx] })),
        descriptions: cloneData.descriptions.map((opt: any, idx: number) => ({
          ...opt,
          id: generateSimpleId(`desc_${idx}`),
          answer_id: arrRandomId[idx]
        }))
      };
    }
    case 3: {
      const cloneData: any[] = cloneDeep(data);
      let arrRandomId: any[] = [];
      cloneData?.forEach((_: any, idx: number) => {
        arrRandomId.push(generateSimpleId(`answer_${idx}`));
      });

      return {
        options: cloneData?.map((opt: any, idx: number) => ({ ...opt, id: arrRandomId[idx] }))
      };
    }
  }
};
