import {fireEvent, getByRole, getByText, cleanup, render, screen, waitFor} from '@testing-library/react'

import React, { ChangeEvent } from 'react';

import App, {Item, List, SearchForm, InputWithLabel } from './App';
import axios from 'axios';

jest.mock('axios');
const mockAxiosGet = axios.get as jest.Mock;

describe('Item', () => {
  const item = {
    title: 'React',
    url: 'http://reactjs.org',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: '0',
  }

  const handleRemoveItem = jest.fn();

  test('props', () => {
    
    render(<Item item={item} onRemoveItem={handleRemoveItem} />)
    const linkElement = screen.getByRole('link');
    expect(linkElement.getAttribute('href')).toBe(item.url);

    const span = screen.queryAllByText(item.author);
    expect(span.length).toEqual(1);
    expect(span[0].textContent).toEqual(item.author);
  });

  test('calls onRemoveItem on button click', () => {
    render(<Item item={item} onRemoveItem={handleRemoveItem} />)

    const button = screen.getAllByRole('button');
    expect(button).toHaveLength(1);
    fireEvent.click(button[0]);
    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
    expect(handleRemoveItem).toHaveBeenCalledWith(item);
  });

  test('renders snapshot', () => {
    const {container} = render(<Item item={item} onRemoveItem={handleRemoveItem} />)
    expect(container).toMatchSnapshot();
  })
})

describe('List', () => {

  const list = [
    {
      title: 'React',
      url: 'http://reactjs.org',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: '0',
    },
    {
      title: 'Redux',
      url: 'http://redux.js.org',
      author: 'Dam Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: '1',
    },
  ];

  const handleRemoveItem = jest.fn();

  test('render two items', () => {
    render(<List data-testid="listitem" list={list} onRemoveItem={handleRemoveItem}/>)
    const items  = screen.getAllByRole('link');
    expect(items).toHaveLength(2);
    expect(items.forEach((item, i) => {expect(item.getAttribute('href')).toBe(list[i].url)}))
  })
})

describe('SearchForm', () => {

  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };

  let input: HTMLInputElement;
  beforeEach(() => {
    render(<SearchForm {...searchFormProps} />);
    input = screen.getByRole('textbox');
  });

  afterEach(cleanup);


  test('render the input field with its value', () => {
    expect(input.value).toBe('React');
  })

  test('changes the input field', () => {
    const pseudoEvent = { target: { value: 'Redux' } };
    
    fireEvent.change(input, pseudoEvent);

    expect(input.value).toBe('Redux')
    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
    expect(searchFormProps.onSearchInput).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({value: 'Redux'}),
    }));
  })

  test('disable the button and prevent submit', () => {
    fireEvent.change(input, {target: {value: ''}});

    expect(screen.getAllByRole('button')).toBeDisabled;
  })
})

describe('App', () => {


  test('succeeds fetching data with a list', async () => {
    const list = [
      {
        title: 'React',
        url: 'https://reactjs.org/',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: '0',
      },
      {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: '1',
      }
    ]

    const promise = Promise.resolve({
      data: {
        hits: list,
      },
    });

    mockAxiosGet.mockImplementationOnce(() => promise);

    render(<App />);
    await waitFor(() => {
      screen.getAllByRole('link').map((link, idx) => {
        expect(link.getAttribute('href')).toBe(list[idx].url);
      });
    })
  });
    
  test('fails fetching data with list', async () => {
    const promice = Promise.reject();

    mockAxiosGet.mockImplementationOnce(() => promice);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('paragraph').textContent).toBe('Something went wrong ...');
    })
  });
})