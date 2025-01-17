import React, { useEffect, useState, useRef, useReducer, useCallback, ChangeEvent, FormEvent, ReactNode, HTMLAttributes, ButtonHTMLAttributes, ReactElement, RefObject } from 'react'
import axios from 'axios';
import cs from 'classnames';
import styled from 'styled-components';

import styles from './App.module.css';
import {ReactComponent as Check} from './check.svg'
import {ReactComponent as ArrowUp} from './up-arrow-svgrepo-com.svg'
import {ReactComponent as ArrowDown} from './down-arrow-svgrepo-com.svg'

const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;

  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);

  color: #171212;
`;

const StyleHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

interface StyledItemProps extends HTMLAttributes<HTMLDivElement> {

}

const StyledItem = styled.div<StyledItemProps>`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

interface StyledColumnProps {
  width?: string;
}

const StyledColumn = styled.span<StyledColumnProps>`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: ${props => props.width || 'auto'};

  a {
    color: inherit;
  }
`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
}

const StyledButton = styled.button<ButtonProps>`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;

  transition: all 0.1s ease-in;

  &:hover {
    background: #171212;
    color: #ffffff;
  }

  &:hover > svg > g {
    fill: #ffffff;
    stroke: #ffffff;
  }
`;

const StyledButtonHeader = styled.button`
  display: flex;
  background: transparent;
  width: 95%;
  border: none;
  border-bottom: 5px solid #171212;
  align-items: center;
  /* padding: 5px; */
  justify-content: space-between;
  cursor: pointer;
  &:hover {
    background: #171212;
    color: #ffffff;
  }
  &:hover > svg > g {
    fill: #ffffff;
    stroke: #ffffff;
  }
`

const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;

const StyledCheck = styled(Check)`
  height: 18px;
  width: 18px;
`

const StyledArrowUp = styled(ArrowUp).attrs({
  className: 'svgArrow',
})`
  height: 10px;
  width: 10px;
  margin-left: auto;
`

const StyledArrowDown = styled(ArrowDown).attrs({
  className: 'svgArrow',
})`
  height: 10px;
  width: 10px;
  margin-left: auto;
`

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;

const StyledLabel = styled.label`
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
  padding-left: 5px;
  font-size: 24px; 
`;

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;

  font-size: 24px;
  &:focus {
    outline: none;
    box-shadow: 0px 0px 2px red;
  }
`;

const StyledList = styled.div`
  display: flex;
`

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Array<Story>;

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};


interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: {
    list: Stories,
    page: number,
  };
}

interface StoriesChangePageAction {
  type: 'STORIES_CHANGE_PAGE';
  payload: {
    page: number,
  }
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesState = {
  data: Stories;
  page: number;
  isLoading: boolean;
  isError: boolean;
};

type StoriesAction = 
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesChangePageAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction


type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: ReactNode;
}

const sortBy = (list: Object[], key: string, reverse: boolean = false): Object[] => {
  const rev = reverse === true ? -1 : 1;
  let sortedList = list.slice();
  sortedList.sort((f, s) => ( f[key] <= s[key]) === true ? -1 * rev : 1 * rev)
  return sortedList;
}

const InputWithLabel = ({
  id,
  value,
  type = 'text',
  onInputChange,
  children,
  isFocused,
}: InputWithLabelProps) => {
  const inputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <StyledLabel htmlFor={id}>{children}</StyledLabel>
      &nbsp;
      <StyledInput
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  );
};


type SearchProps = {
  id: string,
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
}


const Search = ({ id, onInputChange, searchTerm }: SearchProps) => (
  <StyledColumn>
    <InputWithLabel
      id={id}
      value={searchTerm}
      onInputChange={onInputChange}
    >
      Search:
    </InputWithLabel>
  </StyledColumn>
);

type SearchFormPrpops = {
  searchTerm: string;
  onSearchInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const SearchForm =
  ({
    searchTerm,
    onSearchInput,
    onSearchSubmit,
  }: SearchFormPrpops) => {
    // const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

    // const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    //   setSearchTerm(event.target.value);
    //   if (onSearchInput) {
    //     onSearchInput(event);
    //   }
    // };

    return (
      <StyledSearchForm onSubmit={onSearchSubmit} className={styles.searchForm}>
        <Search
          id="search"
          onInputChange={onSearchInput}
          searchTerm={searchTerm}
        />
        <StyledButtonLarge type="submit" disabled={!searchTerm}>
          Submit
        </StyledButtonLarge>
      </StyledSearchForm>
    )
};

const SORTS = {
  NONE: (list: Object[], reverse: boolean = false) => list,
  TITLE: (list: Object[], reverse: boolean = false) => sortBy(list, 'title', reverse),
  AUTHOR: (list: Object[], reverse: boolean = false) => sortBy(list, 'author', reverse),
  COMMENT: (list: Object[], reverse: boolean = false) => sortBy(list, 'num_comments', reverse),
  POINT: (list: Object[], reverse: boolean = false) => sortBy(list, 'points', reverse),
}

const List = ({list, onRemoveItem}: ListProps) => {
  const [sort, setSort] = React.useState({
    sortKey: 'NONE',
    isReverse: false,
  });

  const handleSort = (sortKey: string) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({sortKey, isReverse});
  };

  const getSVGArrow = (sortKey: string) : ReactElement => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    if (sort.sortKey === sortKey)
      return (isReverse === false) ? <StyledArrowDown/> : <StyledArrowUp/>
    
    return
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sortFunction(list, sort.isReverse);

  return (
    <>
      <StyledList>
        <StyledColumn width="40%"><StyledButtonHeader onClick={() => handleSort('TITLE')}>Tytle{getSVGArrow('TITLE')}</StyledButtonHeader></StyledColumn>
        <StyledColumn width='30%'><StyledButtonHeader onClick={() => handleSort('AUTHOR')}>Author{getSVGArrow('AUTHOR')}</StyledButtonHeader></StyledColumn>
        <StyledColumn width='10%'><StyledButtonHeader onClick={() => handleSort('COMMENT')}>Comments{getSVGArrow('COMMENT')}</StyledButtonHeader></StyledColumn>
        <StyledColumn width='10%'><StyledButtonHeader onClick={() => handleSort('POINT')}>Points{getSVGArrow('POINT')}</StyledButtonHeader></StyledColumn>
        <StyledColumn width='10%'></StyledColumn>
      </StyledList>
      {Array.isArray(sortedList) && sortedList.map((item) => (
        <Item 
          key={item.objectID}
          item={item}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </>
  );
};


type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

const Item = ({
  item,
  onRemoveItem,
}: ItemProps) => {
  
  const handleRemoveItem = () => {
    onRemoveItem(item);
  }

  return (
    <StyledItem>
      <StyledColumn width="40%">
        <a href={item.url}>{ item.title }</a>
      </StyledColumn>
      
      <StyledColumn width="30%">{item.author}</StyledColumn>
      <StyledColumn width="10%">{item.num_comments}</StyledColumn>
      <StyledColumn width="10%">{item.points }</StyledColumn>
      <StyledColumn width="10%">
        <StyledButtonSmall 
          type="button" 
          onClick={handleRemoveItem}
          className={cs(styles.button, styles.buttonSmall)}
        >
            <StyledCheck></StyledCheck>

        </StyledButtonSmall>
      </StyledColumn>
    </StyledItem>
  );
}

const useSemiPersistentState = (
  key: string,
  initialState: string,
): [string, (newValue: string) => void] => {
  const isMounted = useRef(false);

  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};


const storiesReducer = (
  state: StoriesState, 
  action: StoriesAction,
) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        is_error: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data:
          action.payload.page === 0
          ? action.payload.list
          : state.data.concat(action.payload.list),
        page: action.payload.page,
      };
    case 'STORIES_CHANGE_PAGE':
      return {
        ...state,
        page: action.payload.page,
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      }
    default:
      throw new Error();
  }
}

const getSumComment = (stories: Stories) => {

  return Array.isArray(stories) && stories.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const extractSearchTerm = (url: string) => url
  .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
  .replace(PARAM_SEARCH, '');
  
const getLastSearches = (urls: string[]) => {
  const searchTerms = urls.map(extractSearchTerm);
  return searchTerms
    .filter((searchTerm, index) => searchTerms.lastIndexOf(searchTerm) === index)
    .slice(-6, -1);
}

const getUrl = (searchTerm: string, page: number) => 
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [urls, setUrls] = useState([getUrl(searchTerm, 0)]);
  const observerTarget = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    {data: [], page: 0, isLoading: false, isError: false},
  );

  const sumComments = getSumComment(stories.data);

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleLastSearch = (lastSearchTerm: string) => {
    setSearchTerm(lastSearchTerm);
    handleSearch(lastSearchTerm, 0);
  }

  const lastSearches = getLastSearches(urls);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    handleSearch(searchTerm, 0);

    event.preventDefault();
  };

  const handleSearch = (searchTerm: string, page: number) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  }

  const handleMore = useCallback(() => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page);
  }, [stories.page])

  const increasePage = () => {
    dispatchStories({
      type: 'STORIES_CHANGE_PAGE', 
      payload: {
        page: stories.page + 1,
      },
    });
  };

  const handleRemoveStory = (item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  };

  const handleFetchStories = useCallback(async () => {

    if (stories.isLoading) {
      return;
    }
    dispatchStories({type: 'STORIES_FETCH_INIT'});

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        },
      });
    } catch {
      dispatchStories({type: 'STORIES_FETCH_FAILURE'});
    }

  }, [urls])

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      }, {threshold: 1}
    );

    if (observerTarget.current && !stories.isLoading) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.disconnect();
      }
    }
  }, [isIntersecting, stories.isLoading, stories.page]);

  useEffect(() => {
    if (isIntersecting) {
      increasePage();
    }
  }, [isIntersecting]);

  useEffect(() => {
    if (stories.page !== 0) {
      handleMore();
    }
  }, [handleMore, stories.page]);

  return (
    <StyledContainer>
      <StyleHeadlinePrimary>{`My Hacker Stories with ${sumComments} comments.`}</StyleHeadlinePrimary>
      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit}/>
      <StyledList>
        {lastSearches.map((searchTerm: string, index: number) => (
          <StyledColumn width="10%">
            <StyledButtonHeader
              key={searchTerm + index}
              type='button'
              onClick={() => handleLastSearch(searchTerm)}  
            >
              {searchTerm}
            </StyledButtonHeader>
          </StyledColumn>
        ))}
      </StyledList>
      
      <hr />

      {stories.isError && <p>Something went wrong ...</p>}
      <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      
      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <StyledButtonHeader onClick={increasePage}>More</StyledButtonHeader>
          <div ref={observerTarget}></div>
        </>
      )}
      
      
    </StyledContainer>
  )
}

export default App;

export {SearchForm, InputWithLabel, List, Item};
